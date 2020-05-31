/**
 * @file electronUpdater/constants.js
 * @description electronUpdater constants
 * @author Abhishek MS <abhishek.ms@hashedin.com>
 * Created on: 26/05/2020
 */

import { INTERNAL_CHANNEL_PREFIX } from 'constants';

// Internal channels
export const CHECK_FOR_UPDATES = `${INTERNAL_CHANNEL_PREFIX}CHECK_FOR_UPDATES`;
export const DOWNLOAD_UPDATE = `${INTERNAL_CHANNEL_PREFIX}DOWNLOAD_UPDATE`;
export const CANCEL_UPDATE = `${INTERNAL_CHANNEL_PREFIX}CANCEL_UPDATE`;
export const AUTO_UPDATE = `${INTERNAL_CHANNEL_PREFIX}AUTO_UPDATE`;
export const INSTALL_UPDATES = `${INTERNAL_CHANNEL_PREFIX}INSTALL_UPDATES`;
