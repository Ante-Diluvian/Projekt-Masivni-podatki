/**
  ******************************************************************************
  * @file           : lsm303dlhc.h
  * @brief          : LSM303DLHC Accelerometer gonilnik - header
  ******************************************************************************
  */

#ifndef INC_LSM303DLHC_H_
#define INC_LSM303DLHC_H_

#include "stm32f3xx_hal.h"

/* I2C naslov accelerometra */
#define LSM303DLHC_ACC_ADDR     (0x19 << 1)

/* Registri */
#define LSM303DLHC_CTRL_REG1_A  0x20
#define LSM303DLHC_CTRL_REG4_A  0x23
#define LSM303DLHC_STATUS_REG_A 0x27
#define LSM303DLHC_OUT_X_L_A    0x28
#define LSM303DLHC_WHO_AM_I     0x0F

/* WHO_AM_I vrednost za verifikacijo */
#define LSM303DLHC_WHO_AM_I_VAL 0x33

/* Konfiguracijske vrednosti */
#define LSM303DLHC_ODR_100HZ    0x57
#define LSM303DLHC_AXES_ENABLE  0x07
#define LSM303DLHC_FS_2G        0x00
#define LSM303DLHC_HR_ENABLE    0x08

/* Status bit za nove podatke */
#define LSM303DLHC_ZYXDA        0x08

/* Obcutljivost v mg/LSB za razlicne obsege */
#define LSM303DLHC_SENS_2G      1.0f
#define LSM303DLHC_SENS_4G      2.0f
#define LSM303DLHC_SENS_8G      4.0f
#define LSM303DLHC_SENS_16G     12.0f

/* Struktura za podatke accelerometra */
typedef struct {
    /* Surove vrednosti iz senzorja */
    int16_t x_raw;
    int16_t y_raw;
    int16_t z_raw;
    
    /* Vrednosti v enotah g (gravitacija) */
    float x_g;
    float y_g;
    float z_g;
    
    /* Vrednosti v m/s^2 */
    float x_ms2;
    float y_ms2;
    float z_ms2;
} AccelData_t;

/* Inicializacija accelerometra */
HAL_StatusTypeDef LSM303DLHC_Init(I2C_HandleTypeDef *hi2c);

/* Branje WHO_AM_I registra za preverjanje komunikacije */
uint8_t LSM303DLHC_ReadWhoAmI(I2C_HandleTypeDef *hi2c);

/* Preverjanje ali so novi podatki na voljo */
uint8_t LSM303DLHC_DataReady(I2C_HandleTypeDef *hi2c);

/* Branje podatkov accelerometra */
HAL_StatusTypeDef LSM303DLHC_ReadAccel(I2C_HandleTypeDef *hi2c, AccelData_t *data);

/* Kalibracija accelerometra na ravni povrsini */
void LSM303DLHC_Calibrate(I2C_HandleTypeDef *hi2c);

#endif /* INC_LSM303DLHC_H_ */
