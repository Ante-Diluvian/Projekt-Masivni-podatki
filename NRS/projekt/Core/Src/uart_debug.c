/**
  ******************************************************************************
  * @file           : uart_debug.c
  * @brief          : UART debug utilities implementation
  * @description    : Printf-style debugging over UART2 (ST-Link Virtual COM)
  ******************************************************************************
  */

#include "uart_debug.h"
#include <stdarg.h>

/* Private variables */
static UART_HandleTypeDef *debug_huart = NULL;
static char tx_buffer[256];

/**
  * @brief  Initialize debug UART
  * @param  huart: UART handle (typically &huart2)
  */
void Debug_Init(UART_HandleTypeDef *huart)
{
    debug_huart = huart;
}

/**
  * @brief  Send string over debug UART
  * @param  str: Null-terminated string
  */
void Debug_Print(const char *str)
{
    if (debug_huart == NULL) return;
    HAL_UART_Transmit(debug_huart, (uint8_t*)str, strlen(str), 100);
}

/**
  * @brief  Printf-style formatted output over debug UART
  * @param  format: Format string
  * @param  ...: Variable arguments
  */
void Debug_Printf(const char *format, ...)
{
    if (debug_huart == NULL) return;
    
    va_list args;
    va_start(args, format);
    int len = vsnprintf(tx_buffer, sizeof(tx_buffer), format, args);
    va_end(args);
    
    if (len > 0)
    {
        HAL_UART_Transmit(debug_huart, (uint8_t*)tx_buffer, len, 100);
    }
}

/**
  * @brief  Send accelerometer data in CSV format
  * @param  x: X-axis value in g
  * @param  y: Y-axis value in g
  * @param  z: Z-axis value in g
  * @note   Format: "x,y,z\r\n" (e.g., "0.12,-0.05,0.98\r\n")
  */
void Debug_SendAccelData(float x, float y, float z)
{
    Debug_Printf("%.3f,%.3f,%.3f\r\n", x, y, z);
}

/**
  * @brief  Send accelerometer data in JSON format
  * @param  x: X-axis value in g
  * @param  y: Y-axis value in g
  * @param  z: Z-axis value in g
  * @note   Format: {"x":0.12,"y":-0.05,"z":0.98}\n
  */
void Debug_SendAccelDataJSON(float x, float y, float z)
{
    Debug_Printf("{\"x\":%.3f,\"y\":%.3f,\"z\":%.3f}\n", x, y, z);
}
