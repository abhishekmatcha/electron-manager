/**
 * @file index.renderer.js
 * @description electron-manager renderer modules
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 25/05/2020
 */

import electronUpdater from './modules/electronUpdater/electronUpdater.renderer';
import ipc from './modules/ipc/ipc.renderer';
import logger from './modules/logger/logger.renderer';
import storageManager from './modules/storageManager/storageManager.renderer';
import windowManager from './modules/windowManager/windowManager.renderer';

export default {
  electronUpdater,
  ipc,
  logger,
  storageManager,
  windowManager
}
