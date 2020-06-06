/**
 * @class WindowManager
 * @description WindowManager module for main process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 12/05/2020
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import URL from 'url';
import { isDev } from '../../utils';
import * as CONSTANTS from './constants';

class WindowManager {
  constructor() {
    this._started = false;
    this._windows = new Map();

    // Config params
    this._enableDevTools = false;
    this._windowUrlPath = process.env.ELECTRON_START_URL || path.join(app.getAppPath(), `dist/renderer`);

    // Internal IPC event listeners
    ipcMain.on(CONSTANTS.WM_CREATE_WINDOW, this._createWindow);
    ipcMain.on(CONSTANTS.WM_GET_WINDOWID_BY_NAME, (event, windowName) => { event.returnValue = this.getWindowIdByName(windowName) });
    ipcMain.on(CONSTANTS.WM_GET_ALL_WINDOW_NAMES, (event) => { event.returnValue = this.getAllWindowNames() });
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
    const updatedWindowOptions = {
      ...defaultConfig,
      ...options,
      webPreferences: {
        ...defaultConfig.webPreferences,
        ...options.webPreferences
      }
    };

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

    // Register window on WindowManager
    this._add(windowId, { id: windowId, name: (name || `window_${windowId}`) });

    // Unregister window from WindowManager
    if (windowInstance && !windowInstance.isDestroyed()) {
      windowInstance.on('close', () => {
        this._remove(windowId)
      })
    }

    return windowInstance;
  }

  /**
   * @function getWindowByName
   * @param {string} windowName - Window name
   * @description Get window instance using window name
   * @returns {BrowserWindow} BrowserWindow instance
   */
  getWindowByName = (windowName) => {
    if (!windowName) return null;

    const windows = Array.from(this._windows.values());
    const window = windows.find(w => w.name === windowName);

    if (window) return BrowserWindow.fromId(window.id);

    return null;
  }

  /**
   * @function getWindowIdByName
   * @param {string} windowName - Window name
   * @description Get window id using window name
   * @returns {number} Window Id
   */
  getWindowIdByName = (windowName) => {
    const window = this.getWindowByName(windowName);

    return window ? window.id : null;
  }

  /**
   * @function getAllWindowIds
   * @description Return all opened window ids
   * @returns {Array} BrowserWindow ids.
   */
  getAllWindowIds = () => {
    const windows = BrowserWindow.getAllWindows() || [];

    return windows.map(w => w.id);
  }

  /**
   * @function getAllWindowNames
   * @description Return All opened window names
   * @returns {Array} BrowserWindow names.
   */
  getAllWindowNames = () => {
    const windows = Array.from(this._windows.values());

    return windows.map(w => w.name)
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

  /**
   * @function _add
   * @param {number} windowId - BrowserWindow id
   * @param {object} data - Windoe details
   * @description Add new window in WindowManager.
   */
  _add = (windowId, data) => {
    if (this._windows.has(windowId)) return;

    this._windows.set(windowId, data);
  }

  /**
   * @function _remove
   * @param {number} windowId - BrowserWindow id
   * @description Remove window from WindowManager.
   */
  _remove = (windowId) => {
    if (!this._windows.has(windowId)) return;

    this._windows.delete(windowId);
  }
}

export default new WindowManager();
