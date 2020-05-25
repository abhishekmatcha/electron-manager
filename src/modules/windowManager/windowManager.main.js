/**
 * @class WindowManager
 * @description WindowManager for main process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 12/05/2020
 */

import { BrowserWindow, ipcMain } from 'electron';
import merge from 'lodash.merge';
import path from 'path';
import URL from 'url';
import { isDev } from '../../utils';
import {
  WM_CREATE_WINDOW,
  WM_GET_ALL_WINDOW_NAMES,
  WM_GET_WINDOWID_BY_NAME,
  WM_GET_WINDOWIDS_BY_NAME
} from './constants';

class WindowManager {
  constructor() {
    this._started = false;
    this._windows = new Map();

    // Event listeners
    ipcMain.on(WM_CREATE_WINDOW, this._createWindow);
    ipcMain.on(WM_GET_WINDOWID_BY_NAME, (evt, windowName) => { evt.returnValue = this.getWindowIdByName(windowName) });
    ipcMain.on(WM_GET_WINDOWIDS_BY_NAME, (evt, windowName) => { evt.returnValue = this.getWindowIdsByName(windowName) });
    ipcMain.on(WM_GET_ALL_WINDOW_NAMES, (evt) => { evt.returnValue = this.getAllWindowNames() });
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @param { object } config: WindowManager initial configurations
   * @description Initialize WindowManager
   */
  init = (config = {}) => {
    if (this._started) return;

    this._started = true;

    // Set window URL path
    if (config.windowUrlPath) process.env.ELECTRON_START_URL = config.windowUrlPath;
  }

  /**
   * @function createWindow
   * @param { object } config: New window configuration
   * @description Create a new BrowserWindow insatance
   */
  createWindow = (config = {}) => {
    const { name, options = {}, url, devTools = false } = config;
    const defaultConfig = { webPreferences: { devTools: isDev() } }
    const updatedWindowOptions = merge(defaultConfig, options);
    const windowInstance = new BrowserWindow(updatedWindowOptions);
    const windowId = windowInstance.id;

    if (!options.webContents) {
      if (url) {
        windowInstance.loadURL(url);
      } else if (name) {
        let startURL = process.env.ELECTRON_START_URL + `/${name}.html`;

        if (!isDev() || startURL.indexOf('localhost') < 0) {
          startURL = URL.format({
            pathname: path.join(`${process.env.ELECTRON_START_URL}/${name}.html`),
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
    this._register(windowId, { id: windowId, name: (name || `window_${windowId}`) });

    // Unregister window from WindowManager
    if (windowInstance && !windowInstance.isDestroyed()) {
      windowInstance.on('close', () => {
        this._unregister(windowId)
      })
    }

    return windowInstance;
  }

  /**
   * @function getWindowByName
   * @param { string } windowName: Window name
   * @description Return window instance by name
   */
  getWindowByName = (windowName) => {
    if (!windowName) return null;

    const windows = Array.from(this._windows.values());
    const window = windows.find(w => w.name === windowName);

    if (window) return BrowserWindow.fromId(window.id);

    return null;
  }

  /**
   * @function getWindowsByName
   * @param { string } windowName: Window name
   * @description Return a list of window instances by name
   */
  getWindowsByName = (windowName) => {
    if (!windowName) return null;

    const windows = Array.from(this._windows.values());
    const windowList = windows.reduce((acc, w) => {
      if (w.name === windowName) {
        acc.push(BrowserWindow.fromId(w.id));
      }

      return acc;
    }, [])

    return windowList;
  }

  /**
   * @function getAllWindowIds
   * @description Return all opened window ids
   */
  getAllWindowIds = () => {
    const windows = BrowserWindow.getAllWindows() || [];

    return windows.map(w => w.id);
  }

  /**
   * @function getAllWindowNames
   * @description Return All opened window names
   */
  getAllWindowNames = () => {
    const windows = Array.from(this._windows.values());

    return windows.map(w => w.name)
  }

  /**
   * @function getWindowIdByName
   * @param { string } windowName: Window name
   * @description Return a list of window instances by name
   */
  getWindowIdByName = (windowName) => {
    const window = this.getWindowByName(windowName);

    return window ? window.id : null;
  }

  /**
   * @function getWindowIdsByName
   * @param { string } windowName: Window name
   * @description Return a list of window instances by name
   */
  getWindowIdsByName = (windowName) => {
    const windows = Array.from(this._windows.values());
    const windowIds = windows.reduce((acc, w) => {
      if (w.name === windowName) acc.push(w.id);

      return acc;
    }, []);

    return windowIds;
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _register
   * @param { number } windowId: BrowserWindow id
   * @param { object } data: Windoe details
   * @description Register new window in WindowManager.
   */
  _register = (windowId, data) => {
    if (this._windows.has(windowId)) return;

    this._windows.set(windowId, data);
  }

  /**
   * @function _unregister
   * @param { number } windowId: BrowserWindow id
   * @description Unregister window from WindowManager.
   */
  _unregister = (windowId) => {
    if (!this._windows.has(windowId)) return;

    this._windows.delete(windowId);
  }

  /**
   * @function _createWindow
   * @param { object } evt: The event object
   * @param { object } config: Window config
   * @description Return window id of the newly created window.
   */
  _createWindow = (evt, config) => {
    const window = this.createWindow(config)

    evt.returnValue = window ? window.id : null;
  }
}

export default new WindowManager();
