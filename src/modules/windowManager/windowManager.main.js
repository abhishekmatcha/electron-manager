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
    ipcMain.on(CONSTANTS.WM_GET_WINDOW_ID, (event, windowName) => { event.returnValue = this.getWindowId(windowName) });
    ipcMain.on(CONSTANTS.WM_GET_WINDOW_IDS, (event, windowName) => { event.returnValue = this.getWindowIds(windowName) });
    ipcMain.on(CONSTANTS.WM_GET_WINDOW_NAMES, (event) => { event.returnValue = this.getWindowNames() });
    ipcMain.on(CONSTANTS.WM_GET_WINDOW_NAME, (event, windowId) => { event.returnValue = this.getWindowName(windowId) });
    ipcMain.on(CONSTANTS.WM_GET_ALL_WINDOW_NAMES, (event) => { event.returnValue = this.getAllWindowNames() });
    ipcMain.on(CONSTANTS.WM_GET_WINDOWIDS_BY_NAME, (event, windowName) => { event.returnValue = this.getWindowIdsByName(windowName) });
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @param {Object} config - WindowManager initial configurations
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
   * @param {Object} config - New window configuration
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
   * @param {String} windowName - Window name
   * @description Get window instance using window name
   * @returns {BrowserWindow} BrowserWindow instance
   */
  getWindowByName = (windowName) => {
    console.warn('`getWindowByName` is deprecated in this release and will be removed in the next major release. Please use `getWindow` instead.');

    if (!windowName) return null;

    const windows = Array.from(this._windows.values());
    const window = windows.find(w => w.name === windowName);

    return window ? BrowserWindow.fromId(window.id) : null;
  }

  /**
   * @function getWindow
   * @param {String/Number} windowRef - Window reference as id or name
   * @description Find window instance using id or name.
   * @returns {BrowserWindow} BrowserWindow instance
   */
  getWindow = (windowRef) => {
    if (!windowRef) return null;

    switch (typeof windowRef) {
      case 'number': return BrowserWindow.fromId(windowRef)
      case 'string': {
        const windows = Array.from(this._windows.values());
        const window = windows.find(w => w.name === windowRef);

        return window ? BrowserWindow.fromId(window.id) : null;
      }
      default: return null
    }
  }

  /**
   * @function getWindows
   * @param {String/Number} windowRef - Window reference as id or name
   * @description Find windows using id or name.
   * @returns {Array} List of windows
   */
  getWindows = (windowRef) => {
    switch (typeof windowRef) {
      case 'number': {
        const windowInstance = BrowserWindow.fromId(windowRef);

        return windowInstance ? [windowInstance] : [];
      }
      case 'string': {
        const windows = Array.from(this._windows.values());
        const windowInstances = windows.reduce((acc, w) => {
          if (w && w.name === windowRef) {
            const windowInstance = BrowserWindow.fromId(w.id);

            if (windowInstance) acc.push(windowInstance)
          }

          return acc;
        }, []);

        return windowInstances;
      }
      default: {
        const windows = Array.from(this._windows.values());
        const windowInstances = windows.reduce((acc, w) => {
          if (w) {
            const windowInstance = BrowserWindow.fromId(w.id);

            if (windowInstance) acc.push(windowInstance)
          }

          return acc;
        }, []);

        return windowInstances;
      };
    }
  }

  /**
   * @function getWindowIdByName
   * @param {String} windowName - Window name
   * @description Get the id of the window by using window name.
   * @returns {number} Window Id
   */
  getWindowIdByName = (windowName) => {
    console.warn('`getWindowIdByName` is deprecated in this release and will be removed in the next major release. Please use `getWindowId` instead.');

    if (!windowName) return null;

    const window = this.getWindowByName(windowName);

    return window ? window.id : null;
  }

  /**
   * @function getWindowId
   * @param {String} windowName - Window name
   * @description Get the id of the window by using window name.
   * @returns {Number} Window Id
   */
  getWindowId = (windowName) => {
    if (!windowName) return null;

    const window = this.getWindow(windowName);

    return window ? window.id : null;
  }

  /**
   * @function getWindowIdsByName
   * @param {String} windowName: Window name
   * @description Return a list of window instances by name
   * @returns {Array} an array of window Ids
   */
  getWindowIdsByName = (windowName) => {
    console.warn('`getWindowIdsByName` is deprecated in this release and will be removed in the next major release. Please use `getWindowIds` instead.');

    if (!windowName) return [];

    const windows = Array.from(this._windows.values());
    const windowIds = windows.reduce((acc, w) => {
      if (w.name && w.id && w.name === windowName) acc.push(w.id);

      return acc;
    }, []);

    return windowIds;
  }

  /**
   * @function getWindowIds
   * @param {String} windowName - Window name
   * @description Return a list of window instances by window name. If window name is not present, then return all window ids.
   * @returns {Array} an array of window Ids
   */
  getWindowIds = (windowName) => {
    const windows = Array.from(this._windows.values());
    const windowIds = windows.reduce((acc, w) => {
      if (windowName) {
        if (w.name && w.name === windowName) acc.push(w.id);
      } else {
        if (w.id) acc.push(w.id);
      }

      return acc;
    }, []);

    return windowIds;
  }

  /**
   * @function getWindowName
   * @param {Number} windowId - Window id
   * @description Get window name from id
   * @returns {String} Window name
   */
  getWindowName = (windowId) => {
    if (!windowId) return null;

    const windows = Array.from(this._windows.values());
    const window = windows.find(w => w.id === windowId);

    return window ? window.name : null;
  }

  /**
   * @function getWindowNames
   * @param {Number} windowId - Window id
   * @description Get window name from id
   * @returns {String} Window name
   */
  getWindowNames = () => {
    const windows = Array.from(this._windows.values());

    return windows.map(w => w.name)
  }

  /**
   * @function getWindowsByName
   * @param {String} windowName - Window name
   * @description Return a list of window instances by name
   * @returns {Array} Windows with given name
   */
  getWindowsByName = (windowName) => {
    console.warn('`getWindowsByName` is deprecated in this release and will be removed in the next major release. Please use `getWindows` instead.');

    if (!windowName) return null;

    const windows = Array.from(this._windows.values());
    const windowList = windows.reduce((acc, w) => {
      if (w.id && w.name && w.name === windowName) {
        acc.push(BrowserWindow.fromId(w.id));
      }

      return acc;
    }, [])

    return windowList;
  }

  /**
   * @function getAllWindowIds
   * @description Return all opened window ids
   * @returns {Array} BrowserWindow ids.
   */
  getAllWindowIds = () => {
    console.warn('`getAllWindowIds` is deprecated in this release and will be removed in the next major release. Please use `getWindowIds` instead.');

    const windows = BrowserWindow.getAllWindows() || [];

    return windows.map(w => w.id);
  }

  /**
   * @function getAllWindowNames
   * @description Return All opened window names
   * @returns {Array} BrowserWindow names.
   */
  getAllWindowNames = () => {
    console.warn('`getAllWindowNames` is deprecated in this release and will be removed in the next major release. Please use `getWindowNames` instead.');

    const windows = Array.from(this._windows.values());

    return windows.map(w => w.name)
  }

  /**
   * @function closeWindow
   * @param {String/Number} windowRef - Window reference as id or name
   * @description Close window
   */
  closeWindow = (windowRef) => {
    if (!windowRef) return;

    const windowInstance = this.getWindow(windowRef);

    if (windowInstance && !windowInstance.isDestroyed()) windowInstance.close();
  }

  /**
   * @function destroyWindow
   * @param {String/Number} windowRef - Window reference as id or name
   * @description Destroy window
   */
  destroyWindow = (windowRef) => {
    if (!windowRef) return;

    const windowInstance = this.getWindow(windowRef);

    if (windowInstance && !windowInstance.isDestroyed()) windowInstance.destroy();
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _createWindow
   * @param {Object} event - The event object
   * @param {Object} config: Window config
   * @description Create a browser window instance 
   * @returns {Number} window id of the newly created window.
   */
  _createWindow = (event, config) => {
    const window = this.createWindow(config)

    evt.returnValue = window ? window.id : null;
  }

  /**
   * @function _add
   * @param {Number} windowId - BrowserWindow id
   * @param {Object} data - Windoe details
   * @description Add new window in WindowManager.
   */
  _add = (windowId, data) => {
    if (this._windows.has(windowId)) return;

    this._windows.set(windowId, data);
  }

  /**
   * @function _remove
   * @param {Number} windowId - BrowserWindow id
   * @description Remove window from WindowManager.
   */
  _remove = (windowId) => {
    if (!this._windows.has(windowId)) return;

    this._windows.delete(windowId);
  }
}

export default new WindowManager();
