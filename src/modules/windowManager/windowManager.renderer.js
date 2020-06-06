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
    if (!windowName) return null;

    const windowId = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWID_BY_NAME, windowName);

    return windowId ? BrowserWindow.fromId(windowId): null;
  }

  /**
   * @function getWindowIdByName
   * @param {String} windowName - Window name
   * @description Get window id using window name
   * @returns {Number} Window Id
   */
  getWindowIdByName = (windowName) => {
    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWID_BY_NAME, windowName);
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
    return ipcRenderer.sendSync(CONSTANTS.WM_GET_ALL_WINDOW_NAMES);
  }

  /**
   * @function getWindowsByName
   * @param {String} windowName - Window name
   * @description Return a list of window instances by name
   * @returns {Array} BrowserWindows with the given name.
   */
  getWindowsByName = (windowName) => {
    const windowIds = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWIDS_BY_NAME, windowName);
    const windowList = windowIds.reduce((acc, windowId) => {
      windowId && acc.push(BrowserWindow.fromId(windowId));

      return acc;
    }, [])

    return windowList;
  }

  /**
   * @function getWindowIdsByName
   * @param {String} windowName - Window name
   * @description Return a list of window instances by name
   * @returns {Array} Array of windowIds by name
   */
  getWindowIdsByName = (windowName) => {
    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWIDS_BY_NAME, windowName);
  }
}

export default new WindowManager();
