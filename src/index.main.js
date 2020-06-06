
/**
 * @file index.main.js
 * @description electron-manager main modules
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 25/05/2020
 */

import electronUpdater from './modules/electronUpdater/electronUpdater.main';
import ipc from './modules/ipc/ipc.main';
import logger from './modules/logger/logger.main';
import storageManager from './modules/storageManager/storageManager.main';
import windowManager from './modules/windowManager/windowManager.main';

export default {
  electronUpdater,
  ipc,
  logger,
  storageManager,
  windowManager
}
