/**
 * @class WindowManager
 * @description WindowManager module for main process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 12/05/2020
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import merge from 'lodash.merge';
import path from 'path';
import URL from 'url';
import { isDev } from '../../utils';
import * as CONSTANTS from './constants';

class WindowManager {
  constructor() {
    this._started = false;
    this._enableDevTools = false;
    this._windowUrlPath = process.env.ELECTRON_START_URL || path.join(app.getAppPath(), `dist/renderer`);

    // Internal IPC event listeners
    ipcMain.on(CONSTANTS.WM_CREATE_WINDOW, this._createWindow);
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @param {object} config - WindowManager initial configurations
   * @description Initialize WindowManager module
   */
  init = (config = {}) => {
    if (this._started) return;

    this._started = true;

    // Add Default configs
    const {
      enableDevTools = false,
      windowUrlPath = path.join(app.getAppPath(), `dist/renderer`)
    } = config;

    // Set default configurations
    this._enableDevTools = enableDevTools;
    this._windowUrlPath = process.env.ELECTRON_START_URL || windowUrlPath;
  }

  /**
   * @function createWindow
   * @param {object} config - New window configuration
   * @description Create a new BrowserWindow insatance with the given configuration
   * @returns {BrowserWindow} BrowserWindow instance
   */
  createWindow = (config = {}) => {
    const { name, options = {}, url, devTools = true } = config;
    const defaultConfig = { webPreferences: { devTools: (isDev() || this._enableDevTools) } }
    const updatedWindowOptions = merge(defaultConfig, options);
    const windowInstance = new BrowserWindow(updatedWindowOptions);
    const windowId = windowInstance.id;

    if (!options.webContents) {
      if (url) {
        windowInstance.loadURL(url);
      } else if (name) {
        let startURL = this._windowUrlPath + `/${name}.html`;

        if (!isDev() || startURL.indexOf('localhost') < 0) {
          startURL = URL.format({
            pathname: path.join(`${this._windowUrlPath}/${name}.html`),
            protocol: 'file:',
            slashes: true
          });
        }

        windowInstance.loadURL(startURL);
      }
    }

    // Open devTools if enabled
    if (devTools) windowInstance.webContents.openDevTools();

    return windowInstance;
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _createWindow
   * @param {object} event - The event object
   * @param {object} config: Window config
   * @description Create a browser window instance 
   * @returns {number} window id of the newly created window.
   */
  _createWindow = (event, config) => {
    const window = this.createWindow(config)

    evt.returnValue = window ? window.id : null;
  }
}

export default new WindowManager();
