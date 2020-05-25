/**
 * @file constants.js
 * @description StorageManager constants
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 18/05/2020
 */

import { INTERNAL_CHANNEL_PREFIX } from 'constants';

// Internal channels
export const SM_CREATE_STORAGE = `${INTERNAL_CHANNEL_PREFIX}SM_CREATE_STORAGE`;
export const SM_WRITE_DATA = `${INTERNAL_CHANNEL_PREFIX}SM_WRITE_DATA`;
export const SM_READ_DATA = `${INTERNAL_CHANNEL_PREFIX}SM_READ_DATA`;
