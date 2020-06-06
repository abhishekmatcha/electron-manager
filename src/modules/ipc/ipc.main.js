/**
 * @class Ipc
 * @description Ipc for main process
 * @author Abhishek MS<abhishek.ms@hashedin.com>
 * Created on: 06/06/2020
 */

import { ipcMain, webContents } from 'electron';
import * as CONSTANTS from './constants';

class Ipc {
  constructor() {
    this._started = false;

    // Event listeners
    ipcMain.handle(CONSTANTS.INVOKE_REQUEST, this._handleRequestInvoked);
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

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _sendToAllTargets
   * @param {String} channel: Channel name
   * @param {Any} ...args - Arguments
   * @description Send message to all webContents with the same channel.
   */
  _sendToAllTargets(channel, ...args) {
    webContents.getAllWebContents().forEach((eachWebcontent) => {
      if (eachWebcontent && !eachWebcontent.isDestroyed()) {
        try {
          eachWebcontent.send(channel, ...args);
        } catch (ex) {
          console.log(`Failed while sending to renderer channel ${channel}: ${ex}`);
        }
      } else {
        console.log('webContents either destroyed or not present');
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
      this._sendToAllTargets(CONSTANTS.INVOKE_REQUEST);
      this._sendToAllTargets(channel, ...args);

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
