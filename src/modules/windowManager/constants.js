/**
 * @file windowManager/constants.js
 * @description windowManager constants
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 12/05/2020
 */

import { INTERNAL_CHANNEL_PREFIX } from 'constants';

// Internal channels
export const WM_CREATE_WINDOW = `${INTERNAL_CHANNEL_PREFIX}WM_CREATE_WINDOW`;
export const WM_GET_WINDOWID_BY_NAME = `${INTERNAL_CHANNEL_PREFIX}WM_GET_WINDOWID_BY_NAME`;
export const WM_GET_ALL_WINDOW_NAMES = `${INTERNAL_CHANNEL_PREFIX}WM_GET_ALL_WINDOW_NAMES`;
