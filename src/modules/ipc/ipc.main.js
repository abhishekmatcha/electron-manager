/**
 * @class Ipc
 * @description Ipc for main process
 * @author Abhishek MS<abhishek.ms@hashedin.com>
 * Created on: 06/06/2020
 */

import { ipcMain, webContents } from 'electron';
import windowManager from '../windowManager/windowManager.main';
import * as CONSTANTS from './constants';

class Ipc {
  constructor() {
    this._started = false;

    // Event listeners
    ipcMain.handle(CONSTANTS.INVOKE_REQUEST, this._handleRequestInvoked);
    ipcMain.on(CONSTANTS.SEND_TO_WINDOW, (evt, ...args) => this.sendToWindow(...args));
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @description Initialize Ipc
   */
  init = () => {
    if (this._started) return;

    this._started = true;
  }

  /**
   * @function sendToAll
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description Send message to all webContents with the same channel
   */
  sendToAll(channel, ...args) {
    this._handleSendToAllContents(false, channel, ...args);
  }

  /**
   * @function sendToWebview
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description Send message to all webContents in webview with the same channel.
   */
  sendToWebview(channel, ...args) {
    this._handleSendToAllContents(true, channel, ...args);
  }

  /**
   * @function sendToWindow
   * @param {String/Number} windowRef - Target window name or id
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description Send message to renderer window
   */
  sendToWindow(windowRef, channel, ...args) {
    if (typeof windowRef === 'number') {
      const windowObj = BrowserWindow.fromId(windowRef);

      if (windowObj && !windowObj.isDestroyed()) windowObj.webContents.send(channel, ...args);
    } else if (typeof windowRef === 'string') {
      const windows = windowManager.getWindows(windowRef);

      windows.forEach((windowObj) => {
        if (windowObj && !windowObj.isDestroyed()) windowObj.webContents.send(channel, ...args);
      })
    } else {
      console.error(`[ipc:sendToWindow] - The first argument should be either windowId or windowName`);
    }
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/


  /**
   * @function _handleSendToAllContents
   * @param {Boolean} isWebview - if needed to only send to weview then true
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description sends messages to all the renderer channels
   */
  _handleSendToAllContents = (isWebview, channel, ...args) => {
    webContents.getAllWebContents().forEach((eachWebcontent) => {
      if (eachWebcontent && !eachWebcontent.isDestroyed()) {
        if (isWebview && eachWebcontent.getType() === 'webview') {
          try { eachWebcontent.send(channel, ...args) } catch (ex) { /* no-op */ }
        } else if (!isWebview) {
          try { eachWebcontent.send(channel, ...args) } catch (ex) { /* no-op */ }
        }
      }
    });
  }

  /**
   * @function _handleInvokeRenderer
   * @param {Object} evt - The event object
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description Initialize Ipc
   */
  _handleRequestInvoked = (evt, channel, ...args) => {
    return new Promise((resolve, reject) => {
      this.sendToAll(CONSTANTS.INVOKE_REQUEST);
      this.sendToAll(channel, ...args);

      ipcMain.once(CONSTANTS.RESPONSE_TO_REQUEST, (evt, error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default new Ipc();
