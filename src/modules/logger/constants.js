/**
 * @file constants.js
 * @description logger constants
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 11/05/2020
 */

import { INTERNAL_CHANNEL_PREFIX } from 'constants';

// Internal channels
export const LOGGER_GET_UER_CONFIG = `${INTERNAL_CHANNEL_PREFIX}LOGGER_GET_UER_CONFIG`;
export const LOGGER_WRITE_TO_FILE = `${INTERNAL_CHANNEL_PREFIX}LOGGER_WRITE_TO_FILE`;

// Log types
export const LOG_TYPES = {
  ERROR: 'ERROR',
  INFO: 'INFO',
  LOG: 'LOG',
  WARN: 'WARN',
}
