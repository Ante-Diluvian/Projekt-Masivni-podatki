/**
  ******************************************************************************
  * @file           : uart_debug.h
  * @brief          : UART debug utilities header
  * @description    : Printf-style debugging over UART2 (ST-Link Virtual COM)
  ******************************************************************************
  */

#ifndef INC_UART_DEBUG_H_
#define INC_UART_DEBUG_H_

#include "stm32f3xx_hal.h"
#include <stdio.h>
#include <string.h>

/* Function prototypes */
void Debug_Init(UART_HandleTypeDef *huart);
void Debug_Print(const char *str);
void Debug_Printf(const char *format, ...);
void Debug_SendAccelData(float x, float y, float z);
void Debug_SendAccelDataJSON(float x, float y, float z);

#endif /* INC_UART_DEBUG_H_ */
