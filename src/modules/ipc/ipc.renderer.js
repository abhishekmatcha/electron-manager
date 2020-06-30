/**
 * @class Ipc
 * @description Ipc for renderer process
 * @author Matcha Sesha Abhishek <abhishek.ms@hashedin.com>
 * Created on: 06/06/2020
 */

import { remote, ipcRenderer } from 'electron';
import * as CONSTANTS from './constants';

class Ipc {

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function sendToAll
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description Send message to all webContents with the same channel and also to main.
   */
  sendToAll(channel, ...args) {
    this._handleSendToAllContents(false, channel, ...args);
    ipcRenderer.send(channel, ...args);
  }


  /**
   * @function sendToWebview
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description Send message to all webContents with the same channel.
   */
  sendToWebview(channel, ...args) {
    this._handleSendToAllContents(true, channel, ...args);
  }

  /**
   * @function sendToWindow
   * @param {String/Number} windowRef - Target window name or id
   * @param {String} channel - Channel name
   * @param {Any} ...args - Arguments
   * @description Send a synchronous message to renderer window
   */
  sendToWindow(windowRef, channel, ...args) {
    ipcRenderer.send(CONSTANTS.SEND_TO_WINDOW, windowRef, channel, ...args);
  }

  /**
   * @function request
   * @param {String} channel: Channel name
   * @param {Any} ...args - Arguments
   * @description Send a message to a renderer window and expect a result asynchronously
   */
  request = (channel, ...args) => {
    return ipcRenderer.invoke(CONSTANTS.INVOKE_REQUEST, channel, ...args);
  }

  /**
   * @function respond
   * @param {String} channel - Channel name
   * @param {Function} listener - The handler function
   * @description Register listener for ipcRenderer
   */
  respond = (channel, listener) => {
    ipcRenderer.on(CONSTANTS.INVOKE_REQUEST, () => {
      ipcRenderer.once(channel, (evt, ...args) => {
        const promise = listener(evt, ...args);

        if (promise instanceof Promise) {
          promise
            .then((result) => {
              ipcRenderer.send(CONSTANTS.RESPONSE_TO_REQUEST, null, result);
            })
            .catch((err) => {
              ipcRenderer.send(CONSTANTS.RESPONSE_TO_REQUEST, err);
              console.error(`[ipc:respond] - Failed to handle renderer function: ${channel}: ${err}`);
            });
        } else {
          ipcRenderer.send(CONSTANTS.RESPONSE_TO_REQUEST, null, promise);
        }
      });
    });
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
    remote.webContents.getAllWebContents().forEach((eachWebcontent) => {
      if (eachWebcontent && !eachWebcontent.isDestroyed()) {
        if (isWebview && eachWebcontent.getType() === 'webview') {
          try { eachWebcontent.send(channel, ...args) } catch (ex) { /* no-op */ }
        } else if (!isWebview) {
          try { eachWebcontent.send(channel, ...args) } catch (ex) { /* no-op */ }
        }
      }
    });
  }
}

export default new Ipc();
