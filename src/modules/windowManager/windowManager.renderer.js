/**
 * @class WindowManager
 * @description WindowManager module for renderer process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 12/05/2020
 */

import { ipcRenderer, remote } from 'electron';
import * as CONSTANTS from './constants';

const { BrowserWindow } = remote;

class WindowManager {
  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function createWindow
   * @param {Object} config - New window configuration
   * @description Create a new BrowserWindow insatance
   */
  createWindow = (config) => {
    const windowId = ipcRenderer.sendSync(CONSTANTS.WM_CREATE_WINDOW, config);

    return BrowserWindow.fromId(windowId);
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

    const windowId = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWID_BY_NAME, windowName);

    return windowId ? BrowserWindow.fromId(windowId) : null;
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
      case 'string': return this._getWindowByName(windowRef)
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
    // Return a list of window instances from the list of window ids
    const getWindowInstances = (windowIds = []) => {
      const windowInstances = windowIds.reduce((acc, windowId) => {
        if (windowId) {
          const windowInstance = BrowserWindow.fromId(windowId);

          if (windowInstance) acc.push(windowInstance);

          return acc;
        }
      }, []);

      return windowInstances;
    }

    switch (typeof windowRef) {
      case 'number': {
        const windowInstance = BrowserWindow.fromId(windowRef);

        return windowInstance ? [windowInstance] : [];
      }
      case 'string': {
        const windowIds = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOW_IDS, windowRef);

        return getWindowInstances(windowIds);
      }
      default: {
        const windowIds = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOW_IDS);

        return getWindowInstances(windowIds);
      }
    }
  }

  /**
   * @function getWindowIdByName
   * @param {String} windowName - Window name
   * @description Get window id using window name
   * @returns {Number} Window Id
   */
  getWindowIdByName = (windowName) => {
    console.warn('`getWindowIdByName` is deprecated in this release and will be removed in the next major release. Please use `getWindowId` instead.');

    if (!windowName) return null;

    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWID_BY_NAME, windowName);
  }

  /**
   * @function getWindowId
   * @param {String} windowName - Window name
   * @description Get the id of the window by using window name.
   * @returns {Number} Window Id
   */
  getWindowId = (windowName) => {
    if (!windowName) return null;

    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOW_ID, windowName);
  }

  /**
   * @function getWindowIdsByName
   * @param {String} windowName - Window name
   * @description Return a list of window instances by name
   * @returns {Array} Array of windowIds by name
   */
  getWindowIdsByName = (windowName) => {
    console.warn('`getWindowIdsByName` is deprecated in this release and will be removed in the next major release. Please use `getWindowIds` instead.');

    if (!windowName) return [];

    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWIDS_BY_NAME, windowName);
  }

  /**
   * @function getWindowIds
   * @param {String} windowName - Window name
   * @description Return a list of window instances by window name. If window name is not present, then return all window ids.
   * @returns {Array} an array of window Ids
   */
  getWindowIds = (windowName) => {
    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOW_IDS, windowName);
  }

  /**
   * @function getWindowName
   * @param {Number} windowId - Window id
   * @description Get window name from id
   * @returns {String} Window name
   */
  getWindowName = (windowId) => {
    if (!windowId) return null;

    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOW_NAME, windowId);
  }

  /**
   * @function getWindowNames
   * @param {Number} windowId - Window id
   * @description Get window name from id
   * @returns {String} Window name
   */
  getWindowNames = () => {
    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOW_NAMES);
  }

  /**
   * @function getWindowsByName
   * @param {String} windowName - Window name
   * @description Return a list of window instances by name
   * @returns {Array} BrowserWindows with the given name.
   */
  getWindowsByName = (windowName) => {
    console.warn('`getWindowsByName` is deprecated in this release and will be removed in the next major release. Please use `getWindows` instead.');

    if (!windowName) return null;

    const windowIds = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWIDS_BY_NAME, windowName);
    const windowList = windowIds.reduce((acc, windowId) => {
      windowId && acc.push(BrowserWindow.fromId(windowId));

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

    return ipcRenderer.sendSync(CONSTANTS.WM_GET_ALL_WINDOW_NAMES);
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
   * @function _getWindowByName
   * @param {String} windowName - Window name
   * @description Get window instance using window name
   * @returns {BrowserWindow} BrowserWindow instance
   */
  _getWindowByName = (windowName) => {
    if (!windowName) return null;

    const windowId = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWID_BY_NAME, windowName);

    return windowId ? BrowserWindow.fromId(windowId) : null;
  }
}

export default new WindowManager();
