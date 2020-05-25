/**
 * @class Logger
 * @description Logger for renderer process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 14/11/2019
 */

import { ipcRenderer } from 'electron';
import merge from 'lodash.merge';
import { LOGGER_GET_UER_CONFIG, LOGGER_WRITE_TO_FILE, LOG_TYPES } from './constants';
import { isInitialized, getFormattedString } from './utils';

class Logger {
  constructor() {
    this._started = false;
    this._writeToFile = false;
    this._proxifyConsol = false;

    // Console proxies
    this.consoleError = console.error;
    this.consoleInfo = console.info;
    this.consoleLog = console.log;
    this.consoleWarn = console.warn;
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @param { object } config: Logger configurations
   * @description Initialize Logger
   */
  init = (config = {}) => {
    if (this._started) return;

    // Get main user config
    const mainConfig = ipcRenderer.sendSync(LOGGER_GET_UER_CONFIG);

    // Set configurations
    const finalConfig = merge(mainConfig, config);

    // Set logger properties for renderer process
    this._writeToFile = finalConfig.writeToFile;
    this._proxifyConsol = finalConfig.proxifyConsol;

    // Proxify console methods if it is enabled in the configuration
    this._proxifyConsol && this._proxyConsoleLogs();

    this._started = true;
  }

  /**
   * @function error
   * @param { array } args: Array of arguments
   * @description Logs the error messages.
   */
  error = (...args) => {
    if (isInitialized(this._started)) {
      const message = getFormattedString(LOG_TYPES.ERROR, ...args);

      this.consoleError(message);
      this._writeToFile && ipcRenderer.send(LOGGER_WRITE_TO_FILE, LOG_TYPES.ERROR, message);
    }
  }

  /**
   * @function info
   * @param { array } args: Array of arguments
   * @description Logs the info messages.
   */
  info = (...args) => {
    if (isInitialized(this._started)) {
      const message = getFormattedString(LOG_TYPES.INFO, ...args);

      this.consoleInfo(message);
      this._writeToFile && ipcRenderer.send(LOGGER_WRITE_TO_FILE, LOG_TYPES.INFO, message);
    }
  }

  /**
   * @function log
   * @param { array } args: Array of arguments
   * @description Logs the log messages
   */
  log = (...args) => {
    if (isInitialized(this._started)) {
      const message = getFormattedString(LOG_TYPES.LOG, ...args);

      this.consoleLog(message);
      this._writeToFile && ipcRenderer.send(LOGGER_WRITE_TO_FILE, LOG_TYPES.LOG, message);
    }
  }

  /**
   * @function warn
   * @param { array } args: Array of arguments
   * @description Logs the warning messages
   */
  warn = (...args) => {
    if (isInitialized(this._started)) {
      const message = getFormattedString(LOG_TYPES.WARN, ...args);

      this.consoleWarn(message);
      this._writeToFile && ipcRenderer.send(LOGGER_WRITE_TO_FILE, LOG_TYPES.WARN, message);
    }
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _proxyConsoleLogs
   * @description overwrites console logs
   */
  _proxyConsoleLogs = () => {
    console.error = (...args) => {
      this.error(...args);
    };

    console.info = (...args) => {
      this.info(...args);
    };

    console.log = (...args) => {
      this.log(...args);
    };

    console.warn = (...args) => {
      this.warn(...args);
    };
  }

  /**
   * @function _logToFile
   * @param { string } type: Log type
   * @param { array } args: Arguments
   * @description Console to file
   */
  _logToFile = (type, ...args) => {
    if (!this._writeToFile) return;

    ipcRenderer.send(LOGGER_WRITE_TO_FILE, type, ...args);
  }
}

export default new Logger();
