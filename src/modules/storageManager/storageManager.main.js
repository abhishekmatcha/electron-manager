/**
 * @class StorageManager
 * @description StorageManager for main process
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 18/05/2020
 */

import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import validFilename from 'valid-filename';
import Storage from './storage';
import { SM_CREATE_STORAGE, SM_READ_DATA, SM_WRITE_DATA } from './constants';

class StorageManager {
  constructor() {
    this._started = false;
    this._storageLocation = app.getPath('userData');
    this._storages = new Map();

    // Event listeners
    ipcMain.handle(SM_CREATE_STORAGE, (evt, config = {}) => { return this.createStorage(config) });
    ipcMain.handle(SM_WRITE_DATA, (evt, storageName, data) => { return this.write(storageName, data) });
    ipcMain.handle(SM_READ_DATA, (evt, storageName) => { return this.read(storageName) });
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @param { object } config: Initial configuration object
   * @description Initialize StorageManager
   */
  init = (config = {}) => {
    if (this._started) return;

    this._started = true;

    this._storageLocation = config.storageLocation || app.getPath('userData');
  }

  /**
   * @function createStorage
   * @param { object } config: Initial configuration object
   * @description Initialize StorageManager
   */
  createStorage = (configs = []) => {
    return new Promise((resolve, reject) => {
      const storagePromises = [];

      // Check the type of the input param
      if (typeof configs === 'object') {
        if (!Array.isArray(configs)) {
          configs = [configs];
        }
      } else {
        console.error(`[storageManager][createStorage]: Invalid type: ${typeof configs}. configuration should be an array or object.`);

        return reject();
      }

      // Create storage promises
      configs.forEach((config) => {
        if (config && typeof config === 'object' && !Array.isArray(config)) {
          const {
            extension = 'json',
            initialState = {},
            location = this._storageLocation,
            name
          } = config;

          if (validFilename(name)) {
            const storagePath = path.join(location, `${name}.${extension}`);

            try {
              fs.accessSync(storagePath, fs.constants.F_OK);
              this._storages.set(name, new Storage({ data: initialState, location: storagePath, name, type: extension }))
            } catch (err) {
              storagePromises.push(this._createLocalStorage(config));
            }
          } else {
            console.error(`[StorageManager]: Invalid file name: ${name}`);
            return reject();
          }
        } else {
          console.error(`[storageManager][createStorage]: Invalid type: ${typeof config}${Array.isArray(config) ? '[Array]' : ''}. configuration should be an object.`);
          return reject();
        }
      })

      if (storagePromises.length) {
        // Resolve the promise once all the storages are initialized successfully
        Promise.allSettled(storagePromises)
          .then((results) => {
            const fulfilled = [];
            const rejected = [];

            results.forEach((result) => {
              console.log(result)
              if (result.status === 'fulfilled') {
                fulfilled.push(result.value)
              } else {
                rejected.push(result.value);
              }
            })

            if (rejected.length) {
              console.log(`[storageManager][createStorage]: Failed to create Storages: ${rejected}`);
            }

            if (fulfilled.length) {
              console.log(`[storageManager][createStorage]: Storages created successfully: ${fulfilled}`);
              resolve();
            } else {
              reject();
            }
          })
      } else {
        resolve();
      }
    })
  }

  /**
   * @function read
   * @param { string } storageName: Storage name(File name)
   * @description Read data from the file storage
   */
  read = (storageName) => {
    return new Promise((resolve, reject) => {
      const storage = this._storages.get(storageName)

      if (storage) {
        storage.read()
          .then((data) => { resolve(data); })
          .catch((err) => { reject(); })
      } else {
        console.error(`No storage with the name ${storageName} exists`);
        reject();
      }
    })
  }

  /**
   * @function write
   * @param { string } storageName: Storage name(File name)
   * @param { any } data: Data to be stored
   * @description Write data to the file storage
   */
  write = (storageName, data) => {
    return new Promise((resolve, reject) => {
      const storage = this._storages.get(storageName)

      if (storage) {
        storage.write(data)
          .then((res) => { resolve(res); })
          .catch((err) => { reject(); })
      } else {
        console.error(`No storage with the name ${storageName} exists`);
        reject();
      }
    })
  }

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _createLocalStorage
   * @param { object } config: Storage configuration
   * @description create initial data store
   */
  _createLocalStorage = (config = {}) => {
    return new Promise((resolve, reject) => {
      const {
        extension = 'json',
        initialState = {},
        location = this._storageLocation,
        name
      } = config;
      const data = (extension === 'json') ? JSON.stringify(initialState, null, 2) : initialState;
      const storagePath = path.join(location, `${name}.${extension}`);

      try {
        // Create storage location
        if (!fs.existsSync(location)) {
          fs.mkdirSync(location);
        }

        // Write data
        fs.writeFile(storagePath, data, (err) => {
          if (err) throw err;

          this._storages.set(name, new Storage({ data, location: storagePath, name }))
          resolve(name);
        });
      } catch (err) {
        console.error(`[StorageManager]: Failed to write data into ${storagePath}: ${err}`);
        reject();
      }
    })
  }
}

export default new StorageManager();
