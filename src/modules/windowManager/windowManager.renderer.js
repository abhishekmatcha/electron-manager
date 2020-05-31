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
   * @param {object} config - New window configuration
   * @description Create a new BrowserWindow insatance
   */
  createWindow = (config) => {
    const windowId = ipcRenderer.sendSync(CONSTANTS.WM_CREATE_WINDOW, config);

    return BrowserWindow.fromId(windowId);
  }

  /**
   * @function getWindowByName
   * @param {string} windowName - Window name
   * @description Get window instance using window name
   * @returns {BrowserWindow} BrowserWindow instance
   */
  getWindowByName = (windowName) => {
    if (!windowName) return null;

    const windowId = ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWID_BY_NAME, windowName);

    return BrowserWindow.fromId(windowId);
  }

  /**
   * @function getWindowIdByName
   * @param { string } windowName: Window name
   * @description Get window id using window name
   * @returns {number} Window Id
   */
  getWindowIdByName = (windowName) => {
    return ipcRenderer.sendSync(CONSTANTS.WM_GET_WINDOWID_BY_NAME, windowName);
  }
}

export default new WindowManager();
