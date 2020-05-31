/**
 * @file logger/constants.js
 * @description logger constants
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 11/05/2020
 */

import { INTERNAL_CHANNEL_PREFIX } from 'constants';

// Internal channels
export const GET_LOGGER_CONFIG = `${INTERNAL_CHANNEL_PREFIX}GET_LOGGER_CONFIG`;
export const WRITE_LOGS_TO_FILE = `${INTERNAL_CHANNEL_PREFIX}WRITE_LOGS_TO_FILE`;

// Log types
export const LOG_TYPES = {
  ERROR: 'error',
  INFO: 'info',
  LOG: 'log',
  WARN: 'warn'
}
