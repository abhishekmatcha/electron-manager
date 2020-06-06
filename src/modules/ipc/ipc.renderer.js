/**
 * @class Ipc
 * @description Ipc for renderer process
 * @author Matcha Sesha Abhishek <abhishek.ms@hashedin.com>
 * Created on: 06/06/2020
 */

import { ipcRenderer } from 'electron';
import * as CONSTANTS from './constants';

class Ipc {

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

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
              console.error(`Failed to handle renderer function: ${channel}: ${err}`);
            });
        } else {
          ipcRenderer.send(CONSTANTS.RESPONSE_TO_REQUEST, null, promise);
        }
      });
    });
  }
}

export default new Ipc();
