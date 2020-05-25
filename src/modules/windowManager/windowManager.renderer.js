/**
 * @class WindowManager
 * @description WindowManager for renderer process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 12/05/2020
 */

import { ipcRenderer, remote } from 'electron';
import {
  WM_CREATE_WINDOW,
  WM_GET_ALL_WINDOW_NAMES,
  WM_GET_WINDOWID_BY_NAME,
  WM_GET_WINDOWIDS_BY_NAME
} from './constants';

const { BrowserWindow } = remote;

class WindowManager {
  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function createWindow
   * @param { object } config: New window configuration
   * @description Create a new BrowserWindow insatance
   */
  createWindow = (config) => {
    const windowId = ipcRenderer.sendSync(WM_CREATE_WINDOW, config);

    return BrowserWindow.fromId(windowId);
  }

  /**
   * @function getWindowByName
   * @param { string } windowName: Window name
   * @description Return window instance by name
   */
  getWindowByName = (windowName) => {
    if (!windowName) return null;

    const windowId = ipcRenderer.sendSync(WM_GET_WINDOWID_BY_NAME, windowName);

    return BrowserWindow.fromId(windowId);
  }

  /**
   * @function getWindowsByName
   * @param { string } windowName: Window name
   * @description Return a list of window instances by name
   */
  getWindowsByName = (windowName) => {
    const windowIds = ipcRenderer.sendSync(WM_GET_WINDOWIDS_BY_NAME, windowName);
    const windowList = windowIds.reduce((acc, windowId) => {
      acc.push(BrowserWindow.fromId(windowId));

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
    return ipcRenderer.sendSync(WM_GET_ALL_WINDOW_NAMES);
  }

  /**
   * @function getWindowIdByName
   * @param { string } windowName: Window name
   * @description Return a list of window instances by name
   */
  getWindowIdByName = (windowName) => {
    return ipcRenderer.sendSync(WM_GET_WINDOWID_BY_NAME, windowName);
  }

  /**
   * @function getWindowIdsByName
   * @param { string } windowName: Window name
   * @description Return a list of window instances by name
   */
  getWindowIdsByName = (windowName) => {
    return ipcRenderer.sendSync(WM_GET_WINDOWIDS_BY_NAME, windowName);
  }
}

export default new WindowManager();
