/**
 * @class Storage
 * @description Handle file storage functionalities
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 19/05/2020
 */

import fs from 'fs-extra';
import { getUuid } from 'utils';

class Storage {
  constructor(config = {}) {
    this._data = config.data;
    this._location = config.location;
    this._name = config.name;
    this._readWriteQueue = [];
    this._type = config.type;
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @async
   * @function read
   * @description Read data from the file 
   */
  read = () => {
    return new Promise((resolve, reject) => {
      this._readWriteQueue.push({ type: 'R', resolve, reject });

      // Start file read if the file is free
      if (this._readWriteQueue.length === 1) {
        this._processReadWriteQueue();
      }
    })
  }

  /**
   * @async
   * @function write
   * @param { string } Data to be written
   * @description Write data to the file 
   */
  write = (data) => {
    return new Promise((resolve, reject) => {
      this._readWriteQueue.push({ type: 'W', data, resolve, reject });

      // Start file write if the file is free
      if (this._readWriteQueue.length === 1) {
        this._processReadWriteQueue();
      }
    })
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @async
   * @function _processReadWriteQueue
   * @description Process the read/write queue on request
   */
  _processReadWriteQueue = () => {
    const readWriteQueueItem = this._readWriteQueue[0];

    if (readWriteQueueItem) {
      if (readWriteQueueItem.type === 'R') {
        this._read()
          .then((data) => {
            readWriteQueueItem.resolve(data);
            this._readWriteQueue.shift();
            this._processReadWriteQueue();
          })
          .catch((err) => {
            console.log('Failed to read data', err)
            readWriteQueueItem.reject();
            this._readWriteQueue.shift();
            this._processReadWriteQueue();
          })
      } else {
        this._write(readWriteQueueItem.data)
          .then(() => {
            readWriteQueueItem.resolve(this._data);
            this._readWriteQueue.shift();
            this._processReadWriteQueue();
          })
          .catch((err) => {
            console.log('Failed to wite data', err)
            readWriteQueueItem.reject();
            this._readWriteQueue.shift();
            this._processReadWriteQueue();
          })
      }
    }
  }

  /**
   * @async
   * @function _read
   * @description Read data from the file storage
   */
  _read = () => {
    return new Promise((resolve, reject) => {
      fs.readFile(this._location, 'utf8')
        .then(data => {
          this._data = data;
          this._type === 'json' ? resolve(JSON.parse(data)) : resolve(data);
        })
        .catch(err => {
          console.error(`[StorageManager]: Failed to read data from ${this._location}: ${err}`);
          reject()
        })
    })
  }

  /**
   * @async
   * @function _write
   * @param { string } Data to be written
   * @description Writes the updated data to the storage file
   */
  _write = (rawData) => {
    const tempPath = `${this._location}.${getUuid().replace(/-/g, '')}`;
    const data = JSON.stringify(rawData);

    return Promise.resolve()
      .then(() => fs.open(tempPath, 'w'))
      .then((ref) => {
        return Promise.resolve()
          .then(() => fs.write(ref, data, 0, data))
          .then(() => fs.fsync(ref))
          .then(() => fs.close(ref));
      })
      .then(() => fs.rename(tempPath, this._location))
      .then(() => {
        this._data = data;
      })
      .catch((err) => {
        try { fs.remove(tempPath); } catch (ex) { /* no-op */ }

        console.log(`[StorageManager]: Failed to write data to file: ${this._name}: ${err}`);
      });
  }
}

export default Storage;
