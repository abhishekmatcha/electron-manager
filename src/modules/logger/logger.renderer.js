/**
 * @class Logger
 * @description Logger module for renderer process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 14/11/2019
 */

import { ipcRenderer } from 'electron';
import * as CONSTANTS from './constants';
import { getFormattedString } from './utils';

class Logger {
  constructor() {
    // Override local consols
    this._console = {
      error: console.error,
      info: console.info,
      log: console.log,
      warn: console.warn,
    }

    // Get logger config from main
    const mainConfig = ipcRenderer.sendSync(CONSTANTS.GET_LOGGER_CONFIG);

    this._started = false;
    this._writeToFile = mainConfig.writeToFile || false;
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

    this._started = true;

    // Return if wrong type
    if (typeof config !== 'object' || Array.isArray(config)) {
      return console.error(`[Logger:init] - Configurations should be an object type`)
    }

    // Set configurations
    if (config.writeToFile) {
      if (typeof config.writeToFile === 'boolean') {
        this._writeToFile = config.writeToFile;
      } else {
        console.error(`[Logger:init] - The "writeToFile" argument must be type boolean. Received type ${typeof config.writeToFile}`)
      }
    }

    if ('handleLocalConsole' in config) {
      if (typeof config.handleLocalConsole === 'boolean') {
        console.error = (...args) => this.error(...args);
        console.info = (...args) => this.info(...args);
        console.log = (...args) => this.log(...args);
        console.warn = (...args) => this.warn(...args);
      } else {
        console.error(`[Logger:init] - The "handleLocalConsole" argument must be type boolean. Received type ${typeof config.handleLocalConsole}`)
      }
    }
  }

  /**
   * @function error
   * @param {array} args - List of args to the error statement
   * @description Logs the error messages.
   */
  error = (...args) => {
    const message = getFormattedString(CONSTANTS.LOG_TYPES.ERROR, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.ERROR);
  }

  /**
   * @function info
   * @param {array} args - List of args to the error statement
   * @description Logs the info messages.
   */
  info = (...args) => {
    const message = getFormattedString(CONSTANTS.LOG_TYPES.INFO, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.INFO);
  }

  /**
   * @function log
   * @param {array} args - List of args to the error statement
   * @description Logs the log messages
   */
  log = (...args) => {
    const message = getFormattedString(CONSTANTS.LOG_TYPES.LOG, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.LOG);
  }

  /**
   * @function warn
   * @param {array} args - List of args to the error statement
   * @description Logs the warning messages
   */
  warn = (...args) => {
    const message = getFormattedString(CONSTANTS.LOG_TYPES.WARN, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.WARN);
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _handleConsoleStatement
   * @param {string} message - Message to be consoled
   * @param {string} type - Console Type
   * @description Console loggger messages to local(terminal)
   */
  _handleConsoleStatement = (message, type) => {
    this._console[type](message);

    if (this._writeToFile) ipcRenderer.send(CONSTANTS.WRITE_LOGS_TO_FILE, message);
  }
}

export default new Logger();
