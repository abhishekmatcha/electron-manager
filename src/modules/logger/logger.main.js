/**
 * @class Logger
 * @description Logger module for main process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 14/11/2019
 */

import { app, ipcMain } from 'electron';
import fs from 'fs-extra';
import os, { EOL } from 'os';
import path from 'path';
import { uuid } from 'uuidv4';
import * as CONSTANTS from './constants';
import * as utils from './utils';

class Logger {
  constructor() {
    this._started = false;
    this._cleanLogs = true;
    this._logFolderPath = path.join(app.getPath('userData'), 'logs');
    this._logPeriod = 7;
    this._setFileHeader = true;
    this._writeToFile = true;
    this._file = null;

    // Override local consols
    this._console = {
      error: console.error,
      info: console.info,
      log: console.log,
      warn: console.warn,
    }

    // Internal IPC event listeners
    ipcMain.on(CONSTANTS.GET_LOGGER_CONFIG, this._getLoggerConfig);
    ipcMain.on(CONSTANTS.WRITE_LOGS_TO_FILE, (evt, message) => this._writeLogsToFile(message));
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @param {object} config - Logger configurations
   * @description Initialize Logger main module
   */
  init = (config = {}) => {
    if (this._started) return;

    this._started = true;

    // Return if wrong type
    if (typeof config !== 'object' || Array.isArray(config)) {
      return console.error(`[Logger:init] - Configurations should be an object type`)
    }

    // Set configurations
    if ('cleanLogs' in config) {
      if (typeof config.cleanLogs === 'boolean') {
        this._cleanLogs = config.cleanLogs;
      } else {
        console.error(`[Logger:init] - The "cleanLogs" argument must be type boolean. Received type ${typeof config.cleanLogs}`)
      }
    }

    if ('logFolderPath' in config) {
      if (typeof config.logFolderPath === 'string') {
        this._logFolderPath = config.logFolderPath;
      } else {
        console.error(`[Logger:init] - The "logFolderPath" argument must be type string. Received type ${typeof config.logFolderPath}`)
      }
    }

    if ('logPeriod' in config) {
      if (typeof config.logPeriod === 'number') {
        if (/^\+?[1-9][\d]*$/.test(config.logPeriod)) {
          this._logPeriod = config.logPeriod;
        } else {
          console.error('[Logger:init] - logPeriod should be a positive integer')
        }
      } else {
        console.error(`[Logger:init] - The "logPeriod" argument must be type number. Received type ${typeof config.logPeriod}`)
      }
    }

    if ('setFileHeader' in config) {
      if (typeof config.setFileHeader === 'boolean') {
        this._setFileHeader = config.setFileHeader;
      } else {
        console.error(`[Logger:init] - The "setFileHeader" argument must be type boolean. Received type ${typeof config.setFileHeader}`)
      }
    }

    if ('writeToFile' in config) {
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

    // Generate a file for the current session
    this._file = this._generateLogFilePath();

    // Set file header if it is enabled in the configuration
    if (this._setFileHeader) this._addHeaderInLogFile();
  }

  /**
   * @function error
   * @param {array} args - List of args to the error statement
   * @description Logs the error messages.
   */
  error = (...args) => {
    const message = utils.getFormattedString(CONSTANTS.LOG_TYPES.ERROR, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.ERROR);
  }

  /**
   * @function info
   * @param {array} args - List of args to the error statement
   * @description Logs the info messages.
   */
  info = (...args) => {
    const message = utils.getFormattedString(CONSTANTS.LOG_TYPES.INFO, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.INFO);
  }

  /**
   * @function log
   * @param {array} args - List of args to the error statement
   * @description Logs the log messages.
   */
  log = (...args) => {
    const message = utils.getFormattedString(CONSTANTS.LOG_TYPES.LOG, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.LOG);
  }

  /**
   * @function warn
   * @param {array} args - List of args to the error statement
   * @description Logs the warning messages
   */
  warn = (...args) => {
    const message = utils.getFormattedString(CONSTANTS.LOG_TYPES.WARN, ...args);

    this._handleConsoleStatement(message, CONSTANTS.LOG_TYPES.WARN);
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _getLoggerConfig
   * @param {object} event - IPC event object
   * @description Return custom logger config as reply.
   */
  _getLoggerConfig = (evt) => {
    const userConfig = {
      writeToFile: this._writeToFile
    };

    evt.returnValue = userConfig;
  }

  /**
   * @function _handleConsoleStatement
   * @param {string} message - Message to be consoled
   * @param {string} type - Console Type
   * @description Console loggger messages to local(terminal)
   */
  _handleConsoleStatement = (message, type) => {
    this._console[type](message);

    if (this._writeToFile) this._writeLogsToFile(message);
  }

  /**
   * @function _writeLogsToFile
   * @param {string} message: Stringified message
   * @description Write console statements to file
   */
  _writeLogsToFile = (message) => {
    // Clean logs if the module is not initialized before
    if (!this._started) {
      this._started = true;

      // Clean old log files
      this._cleanLogFiles();
    }

    if (!this._file) {
      this._file = this._generateLogFilePath();

      // Set file header if it is enabled in the configuration
      if (this._setFileHeader) this._addHeaderInLogFile();
    }

    if (this._file) {
      fs.writeFile(this._file, message, { flag: 'a' })
        .catch(err => console.error(err));
    } else {
      console.error('[Logger] - Log file is not been created!')
    }
  }

  /**
   * @function _generateLogFilePath
   * @description Generate a log file path for the current session
   */
  _generateLogFilePath = () => {
    if (!fs.existsSync(this._logFolderPath)) {
      fs.mkdirSync(this._logFolderPath);
    }

    return path.join(this._logFolderPath, `${utils.generateDateTimeFormat()}_${uuid()}.log`);
  }

  /**
   * @function _cleanLogFiles
   * @description Remove all expired logs from the folder.
   */
  _cleanLogFiles = () => {
    const date = new Date();
    const logExpiryDate = date.setDate(date.getDate() - this._logPeriod);

    fs.readdir(this._logFolderPath, (err, files = []) => {
      files.forEach(file => {
        const filePath = path.join(this._logFolderPath, file);

        fs.stat(filePath, (err, stats) => {
          const diffTime = Math.abs(date - stats.birthtime)
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > this._logPeriod) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`[Logger] - Failed to remove log file ${filePath}: ${err}`);
              }
            });
          }
        });
      });
    });
  }

  /**
   * @function _addHeaderInLogFile
   * @description Sets file header
   */
  _addHeaderInLogFile = () => {
    const defaultHeader = {
      AppName: app.getName(),
      AppVersion: app.getVersion(),
      OSName: os.platform(),
      OSRelease: os.release(),
      CPUArchitecture: os.arch()
    };
    const fileHeader = this.fileHeader || defaultHeader;
    let fileHeaderStr = `${EOL}`;

    Object.keys(fileHeader).forEach((key) => {
      fileHeaderStr = `${fileHeaderStr}${key} : ${fileHeader[key]}${EOL}`
    })

    fileHeaderStr = `${fileHeaderStr}${EOL}-----------------------------------------------------------------${EOL}${EOL}`

    this._writeLogsToFile(fileHeaderStr);
  }
}

export default new Logger();
