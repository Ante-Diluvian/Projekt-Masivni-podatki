/* USER CODE BEGIN Header */
/**
 * *****************************************************************************
 * @file           : main.c
 ******************************************************************************
 */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "lsm303dlhc.h"
#include <string.h>
#include <stdio.h>
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* Rezultat AT ukaza */
typedef enum {
  ESP32_OK = 0,
  ESP32_ERROR,
  ESP32_TIMEOUT
} ESP32_Result_t;

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */

/* WiFi podatki - ce so nastavljeni, se uporabijo namesto webserverja */
#define WIFI_SSID "WIFI_SSID"
#define WIFI_PASS "WIFI_PASS"

/* TCP streznik za podatke */
#define TCP_HOST  "10.108.204.142"
#define TCP_PORT  8080

/* Access Point za konfiguracijo */
#define AP_SSID   "ESP32_Setup"
#define AP_PASS   "setup1234"

/* Webserver nastavitve */
#define WEBSERVER_PORT 80
#define WEBSERVER_TIMEOUT 60

/* ESP32 UART nastavitve */
#define ESP32_BUFFER_SIZE 512U
#define ESP32_TIMEOUT_SHORT 1000U
#define ESP32_TIMEOUT_WIFI 15000U
#define ESP32_TIMEOUT_TCP 10000U

/* Cas med vzorci v milisekundah */
#define SAMPLE_INTERVAL_MS 200U

/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/
I2C_HandleTypeDef hi2c1;

SPI_HandleTypeDef hspi1;

TIM_HandleTypeDef htim3;

UART_HandleTypeDef huart1;
UART_HandleTypeDef huart2;

PCD_HandleTypeDef hpcd_USB_FS;

/* USER CODE BEGIN PV */

/* Buffer za sprejem podatkov iz ESP32 */
static char esp32_rx_buffer[ESP32_BUFFER_SIZE];

/* Podatki iz accelerometra */
static AccelData_t accel_data;

/* Zastavica ali je TCP povezava aktivna */
static uint8_t tcp_connected = 0;

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_I2C1_Init(void);
static void MX_SPI1_Init(void);
static void MX_USB_PCD_Init(void);
static void MX_TIM3_Init(void);
static void MX_USART1_UART_Init(void);
static void MX_USART2_UART_Init(void);
/* USER CODE BEGIN PFP */

/* ESP32 AT komunikacija */
static void ESP32_FlushBuffer(void);
static ESP32_Result_t ESP32_WaitResponse(const char *resp1, const char *resp2, uint32_t timeout_ms);
static ESP32_Result_t ESP32_SendCommand(const char *cmd, const char *resp1, const char *resp2, uint32_t timeout_ms);

/* Funkcije za WiFi konfiguracijo */
static HAL_StatusTypeDef ESP32_StartWebserver(void);
static uint8_t ESP32_HasStaticWiFi(void);
static HAL_StatusTypeDef ESP32_ConnectWiFi(void);

/* Funkcije za TCP komunikacijo */
static HAL_StatusTypeDef ESP32_ConnectTCP(void);
static HAL_StatusTypeDef ESP32_SendData(const char *data);

/* Funkcija za prikaz smeri na LED */
static void LED_ShowDirection(AccelData_t *data);
/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */

/* Pocisti UART sprejemni buffer */
static void ESP32_FlushBuffer(void)
{
  uint8_t byte = 0;

  /* Beri vse kar je v bufferju dokler ni prazen */
  while (HAL_UART_Receive(&huart1, &byte, 1, 10) == HAL_OK) {
  }
}

/* Cakaj na odgovor iz ESP32 */
static ESP32_Result_t ESP32_WaitResponse(const char *resp1, const char *resp2, uint32_t timeout_ms)
{
  uint32_t start = HAL_GetTick();
  size_t len = 0;
  uint8_t byte = 0;

  /* Pocisti buffer */
  memset(esp32_rx_buffer, 0, sizeof(esp32_rx_buffer));

  /* Cakaj na odgovor do preteka casa */
  while ((HAL_GetTick() - start) < timeout_ms) {

    /* Preberi znak iz UART */
    if (HAL_UART_Receive(&huart1, &byte, 1, 10) == HAL_OK) {

      /* Dodaj znak v buffer ce je se prostor */
      if (len < (sizeof(esp32_rx_buffer) - 1U)) {
        esp32_rx_buffer[len++] = (char)byte;
        esp32_rx_buffer[len] = '\0';
      }

      /* Preveri ali se je povezava zaprla */
      if (strstr(esp32_rx_buffer, "CLOSED")) {
        tcp_connected = 0;
      }

      /* Preveri ali je prislo do napake */
      if (strstr(esp32_rx_buffer, "ERROR") || strstr(esp32_rx_buffer, "FAIL")) {
        return ESP32_ERROR;
      }

      /* Preveri ali smo dobili pricakovan odgovor */
      if ((resp1 && strstr(esp32_rx_buffer, resp1)) || (resp2 && strstr(esp32_rx_buffer, resp2))) {
        return ESP32_OK;
      }
    }
  }

  return ESP32_TIMEOUT;
}

/* Poslji AT ukaz na ESP32 in cakaj odgovor */
static ESP32_Result_t ESP32_SendCommand(const char *cmd, const char *resp1, const char *resp2, uint32_t timeout_ms)
{
  /* Pocisti buffer pred posiljanjem */
  ESP32_FlushBuffer();

  /* Poslji ukaz preko UART */
  if (HAL_UART_Transmit(&huart1, (uint8_t *)cmd, strlen(cmd), HAL_MAX_DELAY) != HAL_OK) {
    return ESP32_ERROR;
  }

  /* Cakaj na odgovor */
  return ESP32_WaitResponse(resp1, resp2, timeout_ms);
}

/* Zazeni ESP32 webserver za WiFi konfiguracijo */
static HAL_StatusTypeDef ESP32_StartWebserver(void)
{
  char cmd[96];

  /* Omogoci shranjevanje nastavitev v flash */
  if (ESP32_SendCommand("AT+SYSSTORE=1\r\n", "OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    return HAL_ERROR;
  }

  /* Omogoci samodejno povezavo ob zagonu */
  if (ESP32_SendCommand("AT+CWAUTOCONN=1\r\n", "OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    return HAL_ERROR;
  }

  /* Nastavi AP+Station nacin delovanja */
  if (ESP32_SendCommand("AT+CWMODE=3\r\n", "OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    return HAL_ERROR;
  }

  /* Konfiguriraj Access Point */
  snprintf(cmd, sizeof(cmd), "AT+CWSAP=\"%s\",\"%s\",1,3\r\n", AP_SSID, AP_PASS);
  if (ESP32_SendCommand(cmd, "OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    return HAL_ERROR;
  }

  /* Zazeni webserver na portu 80 */
  snprintf(cmd, sizeof(cmd), "AT+WEBSERVER=1,%u,%u\r\n",
           (unsigned)WEBSERVER_PORT, (unsigned)WEBSERVER_TIMEOUT);
  if (ESP32_SendCommand(cmd, "OK", NULL, 10000) != ESP32_OK) {
    return HAL_ERROR;
  }

  return HAL_OK;
}

/* Preveri ali so staticni WiFi podatki nastavljeni */
static uint8_t ESP32_HasStaticWiFi(void)
{
  /* Ce WIFI_SSID ni privzeta vrednost, imamo staticne podatke */
  return (strcmp(WIFI_SSID, "WIFI_SSID") != 0) &&
         (strcmp(WIFI_PASS, "WIFI_PASS") != 0);
}

/* Povezi ESP32 na WiFi omrezje s staticnimi podatki */
static HAL_StatusTypeDef ESP32_ConnectWiFi(void)
{
  char cmd[128];

  /* Nastavi AP+Station nacin */
  if (ESP32_SendCommand("AT+CWMODE=3\r\n", "OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    return HAL_ERROR;
  }

  /* Povezi na WiFi omrezje */
  snprintf(cmd, sizeof(cmd), "AT+CWJAP=\"%s\",\"%s\"\r\n", WIFI_SSID, WIFI_PASS);
  if (ESP32_SendCommand(cmd, "OK", "WIFI GOT IP", ESP32_TIMEOUT_WIFI) != ESP32_OK) {
    return HAL_ERROR;
  }

  /* Nastavi enojno povezavo za TCP */
  if (ESP32_SendCommand("AT+CIPMUX=0\r\n", "OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    return HAL_ERROR;
  }

  return HAL_OK;
}

/* Odpri TCP povezavo do streznika */
static HAL_StatusTypeDef ESP32_ConnectTCP(void)
{
  char cmd[64];

  /* Povezi se na TCP streznik */
  snprintf(cmd, sizeof(cmd), "AT+CIPSTART=\"TCP\",\"%s\",%u\r\n", TCP_HOST, TCP_PORT);
  if (ESP32_SendCommand(cmd, "CONNECT", "OK", ESP32_TIMEOUT_TCP) != ESP32_OK) {
    tcp_connected = 0;
    return HAL_ERROR;
  }

  tcp_connected = 1;
  return HAL_OK;
}

/* Poslji podatke preko TCP povezave */
static HAL_StatusTypeDef ESP32_SendData(const char *data)
{
  char cmd[32];
  size_t len = strlen(data);

  /* Poslji CIPSEND ukaz z dolzino podatkov */
  snprintf(cmd, sizeof(cmd), "AT+CIPSEND=%lu\r\n", (unsigned long)len);
  if (ESP32_SendCommand(cmd, ">", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    tcp_connected = 0;
    return HAL_ERROR;
  }

  /* Poslji dejanske podatke */
  if (HAL_UART_Transmit(&huart1, (uint8_t *)data, len, HAL_MAX_DELAY) != HAL_OK) {
    return HAL_ERROR;
  }

  /* Cakaj potrditev posiljanja */
  if (ESP32_WaitResponse("SEND OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    tcp_connected = 0;
    return HAL_ERROR;
  }

  return HAL_OK;
}

/* Prikazi smer nagiba na LED diodah */
static void LED_ShowDirection(AccelData_t *data)
{
  /* Ugasni vse smerne LED */
  HAL_GPIO_WritePin(GPIOE, LD3_Pin|LD4_Pin|LD5_Pin|LD6_Pin|
                           LD7_Pin|LD8_Pin|LD9_Pin|LD10_Pin, GPIO_PIN_RESET);

  /* X os - levo/desno */
  if (data->x_g > 0.3f) {
    /* Nagib desno */
    HAL_GPIO_WritePin(GPIOE, LD6_Pin, GPIO_PIN_SET);
  } else if (data->x_g < -0.3f) {
    /* Nagib levo */
    HAL_GPIO_WritePin(GPIOE, LD4_Pin, GPIO_PIN_SET);
  }

  /* Y os - naprej/nazaj */
  if (data->y_g > 0.3f) {
    /* Nagib naprej */
    HAL_GPIO_WritePin(GPIOE, LD10_Pin, GPIO_PIN_SET);
  } else if (data->y_g < -0.3f) {
    /* Nagib nazaj */
    HAL_GPIO_WritePin(GPIOE, LD8_Pin, GPIO_PIN_SET);
  }
}

/* USER CODE END 0 */

/**
 * @brief  The application entry point.
 * @retval int
 */
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  MX_GPIO_Init();
  MX_I2C1_Init();
  MX_SPI1_Init();
  MX_USB_PCD_Init();
  MX_USART1_UART_Init();
  MX_USART2_UART_Init();
  /* USER CODE BEGIN 2 */

  /* Pocakaj da se ESP32 zazene */
  HAL_Delay(2000);

  /* Ugasni vse LED */
  HAL_GPIO_WritePin(GPIOE, LD3_Pin|LD4_Pin|LD5_Pin|LD6_Pin|
  LD7_Pin|LD8_Pin|LD9_Pin|LD10_Pin, GPIO_PIN_RESET);


  // KORAK 1: Testiraj ESP32 komunikacijo

  HAL_GPIO_WritePin(GPIOE, LD3_Pin, GPIO_PIN_SET);  /* Rdeca - cakamo */

  while (ESP32_SendCommand("AT\r\n", "OK", NULL, ESP32_TIMEOUT_SHORT) != ESP32_OK) {
    HAL_Delay(1000);
  }

  HAL_GPIO_WritePin(GPIOE, LD3_Pin, GPIO_PIN_RESET);
  HAL_GPIO_WritePin(GPIOE, LD5_Pin, GPIO_PIN_SET);  /* Oranzna - ESP32 OK */

  /* Izklopi odmev ukazov */
  ESP32_SendCommand("ATE0\r\n", "OK", NULL, ESP32_TIMEOUT_SHORT);


  // KORAK 2: Povezi na WiFi

  while (ESP32_ConnectWiFi() != HAL_OK) {
    /* Utripaj z rdeco ce WiFi ne uspe */
    HAL_GPIO_TogglePin(GPIOE, LD3_Pin);
    HAL_Delay(500);
  }

  HAL_GPIO_WritePin(GPIOE, LD3_Pin, GPIO_PIN_RESET);
  HAL_GPIO_WritePin(GPIOE, LD7_Pin, GPIO_PIN_SET);  /* Zelena - WiFi OK */


  // KORAK 3: Inicializiraj accelerometer

  if (LSM303DLHC_Init(&hi2c1) != HAL_OK) {
    while(1) {
      HAL_GPIO_TogglePin(GPIOE, LD3_Pin);
      HAL_Delay(200);
    }
  }

  /* Kalibriraj */
  HAL_GPIO_WritePin(GPIOE, LD9_Pin, GPIO_PIN_SET);
  HAL_Delay(1000);
  LSM303DLHC_Calibrate(&hi2c1);
  HAL_GPIO_WritePin(GPIOE, LD9_Pin, GPIO_PIN_RESET);

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */

    /* Preberi podatke iz accelerometra */
    if (LSM303DLHC_ReadAccel(&hi2c1, &accel_data) == HAL_OK) {

      /* Prikazi smer na LED */
      LED_ShowDirection(&accel_data);

      /* Ce TCP ni povezan, odpri povezavo */
      if (!tcp_connected) {
        if (ESP32_ConnectTCP() != HAL_OK) {
          /* Ponovno povezi WiFi ce TCP ne uspe */
          ESP32_ConnectWiFi();
          HAL_Delay(1000);
          continue;
        }
      }

      /* Oblikuj podatke v JSON format */
      char json_data[64];
      snprintf(json_data, sizeof(json_data), "{\"x\":%.3f,\"y\":%.3f,\"z\":%.3f}\n",
               accel_data.x_g, accel_data.y_g, accel_data.z_g);

      /* Poslji podatke na streznik */
      if (ESP32_SendData(json_data) != HAL_OK) {
        tcp_connected = 0;
      }
    }

    /* Pocakaj do naslednjega vzorca */
    HAL_Delay(SAMPLE_INTERVAL_MS);
  }
  /* USER CODE END 3 */
}

/**
 * @brief System Clock Configuration
 * @retval None
 */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};
  RCC_PeriphCLKInitTypeDef PeriphClkInit = {0};

  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSI|RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_BYPASS;
  RCC_OscInitStruct.HSEPredivValue = RCC_HSE_PREDIV_DIV1;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL6;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_1) != HAL_OK)
  {
    Error_Handler();
  }
  PeriphClkInit.PeriphClockSelection = RCC_PERIPHCLK_USB|RCC_PERIPHCLK_USART1
                              |RCC_PERIPHCLK_USART2|RCC_PERIPHCLK_I2C1;
  PeriphClkInit.Usart1ClockSelection = RCC_USART1CLKSOURCE_PCLK2;
  PeriphClkInit.Usart2ClockSelection = RCC_USART2CLKSOURCE_PCLK1;
  PeriphClkInit.I2c1ClockSelection = RCC_I2C1CLKSOURCE_HSI;
  PeriphClkInit.USBClockSelection = RCC_USBCLKSOURCE_PLL;
  if (HAL_RCCEx_PeriphCLKConfig(&PeriphClkInit) != HAL_OK)
  {
    Error_Handler();
  }
}

static void MX_I2C1_Init(void)
{
  hi2c1.Instance = I2C1;
  hi2c1.Init.Timing = 0x00201D2B;
  hi2c1.Init.OwnAddress1 = 0;
  hi2c1.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;
  hi2c1.Init.DualAddressMode = I2C_DUALADDRESS_DISABLE;
  hi2c1.Init.OwnAddress2 = 0;
  hi2c1.Init.OwnAddress2Masks = I2C_OA2_NOMASK;
  hi2c1.Init.GeneralCallMode = I2C_GENERALCALL_DISABLE;
  hi2c1.Init.NoStretchMode = I2C_NOSTRETCH_DISABLE;
  if (HAL_I2C_Init(&hi2c1) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_I2CEx_ConfigAnalogFilter(&hi2c1, I2C_ANALOGFILTER_ENABLE) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_I2CEx_ConfigDigitalFilter(&hi2c1, 0) != HAL_OK)
  {
    Error_Handler();
  }
}

static void MX_SPI1_Init(void)
{
  hspi1.Instance = SPI1;
  hspi1.Init.Mode = SPI_MODE_MASTER;
  hspi1.Init.Direction = SPI_DIRECTION_2LINES;
  hspi1.Init.DataSize = SPI_DATASIZE_4BIT;
  hspi1.Init.CLKPolarity = SPI_POLARITY_LOW;
  hspi1.Init.CLKPhase = SPI_PHASE_1EDGE;
  hspi1.Init.NSS = SPI_NSS_SOFT;
  hspi1.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_4;
  hspi1.Init.FirstBit = SPI_FIRSTBIT_MSB;
  hspi1.Init.TIMode = SPI_TIMODE_DISABLE;
  hspi1.Init.CRCCalculation = SPI_CRCCALCULATION_DISABLE;
  hspi1.Init.CRCPolynomial = 7;
  hspi1.Init.CRCLength = SPI_CRC_LENGTH_DATASIZE;
  hspi1.Init.NSSPMode = SPI_NSS_PULSE_ENABLE;
  if (HAL_SPI_Init(&hspi1) != HAL_OK)
  {
    Error_Handler();
  }
}

static void MX_TIM3_Init(void)
{
  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};

  htim3.Instance = TIM3;
  htim3.Init.Prescaler = 47;
  htim3.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim3.Init.Period = 999;
  htim3.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim3.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  if (HAL_TIM_Base_Init(&htim3) != HAL_OK)
  {
    Error_Handler();
  }
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  if (HAL_TIM_ConfigClockSource(&htim3, &sClockSourceConfig) != HAL_OK)
  {
    Error_Handler();
  }
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  if (HAL_TIMEx_MasterConfigSynchronization(&htim3, &sMasterConfig) != HAL_OK)
  {
    Error_Handler();
  }
}

static void MX_USART1_UART_Init(void)
{
  huart1.Instance = USART1;
  huart1.Init.BaudRate = 115200;
  huart1.Init.WordLength = UART_WORDLENGTH_8B;
  huart1.Init.StopBits = UART_STOPBITS_1;
  huart1.Init.Parity = UART_PARITY_NONE;
  huart1.Init.Mode = UART_MODE_TX_RX;
  huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart1.Init.OverSampling = UART_OVERSAMPLING_16;
  huart1.Init.OneBitSampling = UART_ONE_BIT_SAMPLE_DISABLE;
  huart1.AdvancedInit.AdvFeatureInit = UART_ADVFEATURE_NO_INIT;
  if (HAL_UART_Init(&huart1) != HAL_OK)
  {
    Error_Handler();
  }
}

static void MX_USART2_UART_Init(void)
{
  huart2.Instance = USART2;
  huart2.Init.BaudRate = 115200;
  huart2.Init.WordLength = UART_WORDLENGTH_8B;
  huart2.Init.StopBits = UART_STOPBITS_1;
  huart2.Init.Parity = UART_PARITY_NONE;
  huart2.Init.Mode = UART_MODE_TX_RX;
  huart2.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart2.Init.OverSampling = UART_OVERSAMPLING_16;
  huart2.Init.OneBitSampling = UART_ONE_BIT_SAMPLE_DISABLE;
  huart2.AdvancedInit.AdvFeatureInit = UART_ADVFEATURE_NO_INIT;
  if (HAL_UART_Init(&huart2) != HAL_OK)
  {
    Error_Handler();
  }
}

static void MX_USB_PCD_Init(void)
{
  hpcd_USB_FS.Instance = USB;
  hpcd_USB_FS.Init.dev_endpoints = 8;
  hpcd_USB_FS.Init.speed = PCD_SPEED_FULL;
  hpcd_USB_FS.Init.phy_itface = PCD_PHY_EMBEDDED;
  hpcd_USB_FS.Init.low_power_enable = DISABLE;
  hpcd_USB_FS.Init.battery_charging_enable = DISABLE;
  if (HAL_PCD_Init(&hpcd_USB_FS) != HAL_OK)
  {
    Error_Handler();
  }
}

static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};

  __HAL_RCC_GPIOE_CLK_ENABLE();
  __HAL_RCC_GPIOC_CLK_ENABLE();
  __HAL_RCC_GPIOF_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();

  HAL_GPIO_WritePin(GPIOE, CS_I2C_SPI_Pin|LD4_Pin|LD3_Pin|LD5_Pin
                          |LD7_Pin|LD9_Pin|LD10_Pin|LD8_Pin
                          |LD6_Pin, GPIO_PIN_RESET);

  GPIO_InitStruct.Pin = DRDY_Pin|MEMS_INT3_Pin|MEMS_INT4_Pin|MEMS_INT1_Pin
                          |MEMS_INT2_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_EVT_RISING;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOE, &GPIO_InitStruct);

  GPIO_InitStruct.Pin = CS_I2C_SPI_Pin|LD4_Pin|LD3_Pin|LD5_Pin
                          |LD7_Pin|LD9_Pin|LD10_Pin|LD8_Pin
                          |LD6_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOE, &GPIO_InitStruct);

  GPIO_InitStruct.Pin = B1_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(B1_GPIO_Port, &GPIO_InitStruct);
}

void Error_Handler(void)
{
  __disable_irq();
  while (1)
  {
  }
}

#ifdef  USE_FULL_ASSERT
void assert_failed(uint8_t *file, uint32_t line)
{
}
#endif
