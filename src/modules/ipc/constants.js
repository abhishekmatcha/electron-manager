/**
 * @file constants.js
 * @description Ipc constants
 * @author Abhishek MS<abhishek.ms@hashedin.com>
 * Created on: 06/06/2020
 */

import { INTERNAL_CHANNEL_PREFIX } from 'constants';

// Internal channels
export const INVOKE_REQUEST = `${INTERNAL_CHANNEL_PREFIX}INVOKE_REQUEST,`;
export const RESPONSE_TO_REQUEST = `${INTERNAL_CHANNEL_PREFIX}RESPONSE_TO_REQUEST`;
export const SEND_TO_WINDOW = `${INTERNAL_CHANNEL_PREFIX}SEND_TO_WINDOW`;
