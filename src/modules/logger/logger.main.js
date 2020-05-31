/**
 * @class Logger
 * @description Logger for main process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 14/11/2019
 */

import fs from 'fs-extra';
import os, { EOL } from 'os';
import path from 'path';
import { uuid } from 'uuidv4';
import { ipcMain, app } from 'electron';
import { LOGGER_GET_UER_CONFIG, LOGGER_WRITE_TO_FILE, LOG_TYPES } from './constants';
import { isInitialized, generateDateTimeFormat, getFormattedString } from './utils';

class Logger {
  constructor() {
    this._started = false;

    // Console proxies
    this.consoleError = console.error;
    this.consoleInfo = console.info;
    this.consoleLog = console.log;
    this.consoleWarn = console.warn;

    // Event listeners for logger module
    ipcMain.on(LOGGER_GET_UER_CONFIG, (evt) => {
      const userConfig = {
        writeToFile: this._writeToFile,
        proxifyConsol: this._proxifyConsol
      };

      evt.returnValue = userConfig;
    });

    ipcMain.on(LOGGER_WRITE_TO_FILE, (evt, message) => {
      this._writeLogsToFile(message);
    });
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

    const {
      writeToFile = true,
      logPeriod = 30,
      proxifyConsol = false,
      setFileHeader = true,
      cleanLogs = true,
      logFolderPath = path.join(app.getPath('userData'), 'logs')
    } = config;

    // Set configurations
    this._writeToFile = writeToFile;
    this._logPeriod = logPeriod;
    this._proxifyConsol = proxifyConsol;
    this._setFileHeader = setFileHeader;
    this._cleanLogs;
    this._logFolderPath = logFolderPath;
    this._file = this._generateLogFilePath();

    // Proxify console methods if it is enabled in the configuration
    if (this._proxifyConsol) this._proxyConsoleLogs();

    // Set file header if it is enabled in the configuration
    if (this._setFileHeader) this._addHeaderInLogFile();

    // Remove logs after expiry if it is enabled in the configuration
    if (this._cleanLogs) this._cleanLogFiles();

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

      if (this._writeToFile) this._writeLogsToFile(LOG_TYPES.ERROR, message);
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

      if (this._writeToFile) this._writeLogsToFile(LOG_TYPES.INFO, message);
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

      if (this._writeToFile) this._writeLogsToFile(LOG_TYPES.LOG, message);
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

      if (this._writeToFile) this._writeLogsToFile(LOG_TYPES.WARN, message);
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
   * @function _writeLogsToFile
   * @param { string } type: Log type
   * @param { string } message: Stringified message
   * @description Console to file
   */
  _writeLogsToFile = (type, message) => {
    if (this._file) {
      fs.writeFile(this._file, message, { flag: 'a' })
        .catch(err => console.error(err));
    } else {
      console.error('[Logger][_writeLogsToFile]: Log file is not been created!')
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

    return path.join(this._logFolderPath, `${generateDateTimeFormat()}_${uuid()}.log`);
  }

  /**
   * @function _cleanLogFiles
   * @description Remove all expired logs from the folder.
   */
  _cleanLogFiles = () => {
    if (typeof this._logPeriod !== "number") {
      console.error('[Logger][cleanLogs]: Invalid logPeriod.');

      return;
    }

    const date = new Date();
    const logExpiryDate = date.setDate(date.getDate() - this._logPeriod);

    fs.readdir(this._logFolderPath, (err, files) => {
      files.forEach(file => {
        const filePath = path.join(this._logFolderPath, file);

        fs.stat(filePath, (err, stats) => {
          const diffTime = Math.abs(date - stats.birthtime)
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 30) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`[Logger][cleanLogs]: Failed to remove log file ${filePath}: ${err}`);
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

    this._writeLogsToFile(undefined, fileHeaderStr);
  }
}

export default new Logger();
