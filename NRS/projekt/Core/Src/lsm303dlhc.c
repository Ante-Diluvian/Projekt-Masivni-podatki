/**
  ******************************************************************************
  * @file           : lsm303dlhc.c
  * @brief          : LSM303DLHC Accelerometer gonilnik - implementacija
  ******************************************************************************
  */

#include "lsm303dlhc.h"

/* Gravitacijska konstanta */
#define GRAVITY_MS2     9.80665f

/* Stevilo vzorcev za kalibracijo */
#define CALIBRATION_SAMPLES 32

/* Trenutna obcutljivost senzorja */
static float current_sensitivity = LSM303DLHC_SENS_2G;

/* Kalibracijski odmiki (offset) za vsako os */
static float offset_x = 0.0f;
static float offset_y = 0.0f;
static float offset_z = 0.0f;

/* Zapisi en bajt v register */
static HAL_StatusTypeDef WriteRegister(I2C_HandleTypeDef *hi2c, uint8_t reg, uint8_t value)
{
    return HAL_I2C_Mem_Write(hi2c, LSM303DLHC_ACC_ADDR, reg, I2C_MEMADD_SIZE_8BIT, &value, 1, 100);
}

/* Preberi en bajt iz registra */
static HAL_StatusTypeDef ReadRegister(I2C_HandleTypeDef *hi2c, uint8_t reg, uint8_t *value)
{
    return HAL_I2C_Mem_Read(hi2c, LSM303DLHC_ACC_ADDR, reg, I2C_MEMADD_SIZE_8BIT, value, 1, 100);
}

/* Preberi WHO_AM_I register za preverjanje komunikacije */
uint8_t LSM303DLHC_ReadWhoAmI(I2C_HandleTypeDef *hi2c)
{
    uint8_t who_am_i = 0;
    
    /* Preberi identifikacijski register */
    ReadRegister(hi2c, LSM303DLHC_WHO_AM_I, &who_am_i);
    
    return who_am_i;
}

/* Inicializacija accelerometra */
HAL_StatusTypeDef LSM303DLHC_Init(I2C_HandleTypeDef *hi2c)
{
    HAL_StatusTypeDef status;
    
    /* Preveri ali je naprava prisotna */
    uint8_t who_am_i = LSM303DLHC_ReadWhoAmI(hi2c);
    if (who_am_i != LSM303DLHC_WHO_AM_I_VAL)
    {
        /* Naprava ni prepoznana */
        return HAL_ERROR;
    }
    
    /* Nastavi CTRL_REG1_A: 100Hz frekvenca, omogoci X,Y,Z osi */
    status = WriteRegister(hi2c, LSM303DLHC_CTRL_REG1_A, 
                           LSM303DLHC_ODR_100HZ | LSM303DLHC_AXES_ENABLE);
    if (status != HAL_OK) {
        return status;
    }
    
    /* Nastavi CTRL_REG4_A: +/-2g obseg, visoka locljivost */
    status = WriteRegister(hi2c, LSM303DLHC_CTRL_REG4_A,
                           LSM303DLHC_FS_2G | LSM303DLHC_HR_ENABLE);
    if (status != HAL_OK) {
        return status;
    }
    
    /* Nastavi obcutljivost glede na izbran obseg */
    current_sensitivity = LSM303DLHC_SENS_2G;
    
    /* Ponastavi kalibracijske odmike */
    offset_x = 0.0f;
    offset_y = 0.0f;
    offset_z = 0.0f;
    
    return HAL_OK;
}

/* Preveri ali so novi podatki na voljo */
uint8_t LSM303DLHC_DataReady(I2C_HandleTypeDef *hi2c)
{
    uint8_t status = 0;
    
    /* Preberi statusni register */
    ReadRegister(hi2c, LSM303DLHC_STATUS_REG_A, &status);
    
    /* Vrni 1 ce so podatki pripravljeni za vse osi */
    return (status & LSM303DLHC_ZYXDA) ? 1 : 0;
}

/* Preberi podatke accelerometra */
HAL_StatusTypeDef LSM303DLHC_ReadAccel(I2C_HandleTypeDef *hi2c, AccelData_t *data)
{
    uint8_t raw_data[6];
    HAL_StatusTypeDef status;
    
    /* Preberi 6 bajtov zacensi z OUT_X_L_A z avtomatskim povecevanjem naslova (0x80) */
    status = HAL_I2C_Mem_Read(hi2c, LSM303DLHC_ACC_ADDR, 
                              LSM303DLHC_OUT_X_L_A | 0x80,
                              I2C_MEMADD_SIZE_8BIT, 
                              raw_data, 6, 100);
    
    if (status != HAL_OK) {
        return status;
    }
    
    /* Sestavi bajte v 16-bitne vrednosti (little-endian) */
    data->x_raw = (int16_t)((raw_data[1] << 8) | raw_data[0]);
    data->y_raw = (int16_t)((raw_data[3] << 8) | raw_data[2]);
    data->z_raw = (int16_t)((raw_data[5] << 8) | raw_data[4]);
    
    /* V nacinu visoke locljivosti so podatki levo poravnani (12-bit), premakni desno za 4 */
    data->x_raw >>= 4;
    data->y_raw >>= 4;
    data->z_raw >>= 4;
    
    /* Pretvori v enote g (mg/LSB * surova / 1000 = g) */
    data->x_g = (float)data->x_raw * current_sensitivity / 1000.0f;
    data->y_g = (float)data->y_raw * current_sensitivity / 1000.0f;
    data->z_g = (float)data->z_raw * current_sensitivity / 1000.0f;
    
    /* Odstej kalibracijske odmike */
    data->x_g -= offset_x;
    data->y_g -= offset_y;
    data->z_g -= offset_z;
    
    /* Pretvori v m/s^2 */
    data->x_ms2 = data->x_g * GRAVITY_MS2;
    data->y_ms2 = data->y_g * GRAVITY_MS2;
    data->z_ms2 = data->z_g * GRAVITY_MS2;
    
    return HAL_OK;
}

/* Kalibracija accelerometra */
/* Naprava mora biti na ravni povrsini med kalibracijo */
/* Pricakovane vrednosti: X=0g, Y=0g, Z=1g */
void LSM303DLHC_Calibrate(I2C_HandleTypeDef *hi2c)
{
    float sum_x = 0.0f;
    float sum_y = 0.0f;
    float sum_z = 0.0f;
    AccelData_t sample;
    uint8_t valid_samples = 0;
    
    /* Ponastavi odmike pred kalibracijo */
    offset_x = 0.0f;
    offset_y = 0.0f;
    offset_z = 0.0f;
    
    /* Zberi vec vzorcev za povprecenje */
    for (uint8_t i = 0; i < CALIBRATION_SAMPLES; i++)
    {
        /* Pocakaj na nove podatke */
        HAL_Delay(20);
        
        /* Preberi vzorec */
        if (LSM303DLHC_ReadAccel(hi2c, &sample) == HAL_OK)
        {
            /* Pristej k vsoti */
            sum_x += sample.x_g;
            sum_y += sample.y_g;
            sum_z += sample.z_g;
            valid_samples++;
        }
    }
    
    /* Izracunaj povprecje in nastavi odmike */
    if (valid_samples > 0)
    {
        /* X in Y os bi morali biti 0 na ravni povrsini */
        offset_x = sum_x / (float)valid_samples;
        offset_y = sum_y / (float)valid_samples;
        
        /* Z os bi morala biti 1g na ravni povrsini */
        /* Odmik je razlika od pricakovane vrednosti */
        offset_z = (sum_z / (float)valid_samples) - 1.0f;
    }
}
