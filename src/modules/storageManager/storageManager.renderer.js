/**
 * @class StorageManager
 * @description StorageManager for renderer process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 18/05/2020
 */

import { ipcRenderer } from 'electron';
import { SM_CREATE_STORAGE, SM_READ_DATA, SM_WRITE_DATA } from './constants';

class StorageManager {
  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function createStorage
   * @param { object } config: Initial configuration object
   * @description Initialize StorageManager
   */
  createStorage = (configs = []) => {
    return ipcRenderer.invoke(SM_CREATE_STORAGE, configs);
  }

  /**
   * @function write
   * @param { string } storageName: Storage name(File name)
   * @param { any } data: Data to be stored
   * @description Write data to local file
   */
  write = (storageName, data) => {
    return ipcRenderer.invoke(SM_WRITE_DATA, storageName, data);
  }

  /**
   * @function read
   * @param { string } storageName: Storage name(File name)
   * @description Read data from the file storage
   */
  read = (storageName) => {
    return ipcRenderer.invoke(SM_READ_DATA, storageName);
  }
}

export default new StorageManager();
