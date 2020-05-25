
/**
 * @file index.main.js
 * @description electron-manager main modules
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 25/05/2020
 */

import logger from './modules/logger/logger.main';
import storageManager from './modules/storageManager/storageManager.main';
import windowManager from './modules/windowManager/windowManager.main';

export default {
  logger,
  storageManager,
  windowManager
}
