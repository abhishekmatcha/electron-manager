/**
 * @class ElectronUpdater
 * @description electronUpdater module for main process
 * @author Abhishek MS <abhishek.ms@hashedin.com>
 * Created on: 22/05/2020
 */

import { ipcMain } from 'electron';
import { autoUpdater, CancellationToken } from 'electron-updater';
import { isDev } from '../../utils';
import * as CONSTANTS from './constants';

class ElectronUpdater {
  constructor() {
    this._started = false;
    this._allowAutoUpdate = false;
    this._downloadInProgress = false;
    this._cancellationToken;

    // Internal IPC event listeners
    ipcMain.on(CONSTANTS.AUTO_UPDATE, this.autoUpdate);
    ipcMain.on(CONSTANTS.CANCEL_UPDATE, this.cancelUpdate);
    ipcMain.on(CONSTANTS.INSTALL_UPDATES, this.installUpdates);
    ipcMain.handle(CONSTANTS.DOWNLOAD_UPDATE, this.downloadUpdates);
    ipcMain.handle(CONSTANTS.CHECK_FOR_UPDATES, this.checkForUpdates);

    // autoUpdater event listeners
    autoUpdater.on('error', this._handleErrorOnUpdate);
    autoUpdater.on('update-available', this._updateAvailable);
    autoUpdater.on('update-not-available', this._updateNotFound);
    autoUpdater.on('update-downloaded', this._handleDownloadCompleted);
    autoUpdater.on('download-progress', this._handleDownloadInProgress);

    // Electron Updater will only work on production mode 
    if (isDev()) {
      console.warn('[ElectronUpdater] - Electron updater features will be disabled in the development environment');
    }
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @description Initialize electronUpdater main module
   */
  init = () => {
    if (this._started) return;

    this._started = true;
  };

  /**
   * @function autoUpdate
   * @description Function to set the autoupdate, This automatically checks, downloads, install the updates.
   */
  autoUpdate = () => {
    this._allowAutoUpdate = true;
    this.checkForUpdates();
  };

  /**
   * @function checkForUpdates
   * @description Function to check if any updates available, if available it returns a resolved promise with the available latest version else rejects.
   */
  checkForUpdates = () => {
    return new Promise((resolve, reject) => {
      // Electron Updater will only work on production mode 
      if (isDev()) return reject();

      // Set auto download feature in autoUpdater
      autoUpdater.autoDownload = this._allowAutoUpdate;

      // Check for updates
      autoUpdater
        .checkForUpdates()
        .then((res) => {
          this._cancellationToken = res.cancellationToken;
          resolve(res.versionInfo.version);
        })
        .catch((err) => {
          console.error(`[ElectronUpdater:checkForUpdates] - Error while checking for update: ${err}`);
          reject();
        });
    });
  };

  /**
   * @function downloadUpdates
   * @description Function to download the available update.
   */
  downloadUpdates = () => {
    if (isDev()) return Promise.reject();

    if (this._cancellationToken) {
      return this._downloadUpdates();
    } else {
      this.checkForUpdates()
        .then(() => {
          return this._downloadUpdates();
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }
  }

  /**
   * @function installUpdates
   * @description Function to install the downloaded update.
   */
  installUpdates = () => {
    // Electron Updater will only work on production mode 
    if (isDev()) return;

    if (!this._downloadInProgress) {
      autoUpdater.quitAndInstall();
      process.exit(0);
    } else {
      console.log('[ElectronUpdater:installUpdates] - Download is in progress, please install after downloading the update');
    }
  };

  /**
   * @function cancelUpdate
   * @description Function to cancel the installing update.
   */
  cancelUpdate = () => {
    // Electron Updater will only work on production mode 
    if (isDev()) return;

    if (this._cancellationToken) {
      this._cancellationToken.cancel();
    } else {
      console.log(`[ElectronUpdater:cancelUpdates] - Unable to cancel updates`);
    }
  };

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _downloadUpdates
   * @description Function to download the available update.
   */
  _downloadUpdates = () => {
    return new Promise((resolve, reject) => {
      this._cancellationToken = new CancellationToken();

      autoUpdater
        .downloadUpdate(this._cancellationToken)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          console.error(`[ElectronUpdater:downloadUpdate] - Error while downloading updates ${err}`);
          this.cancelUpdate();
          reject();
        });
    });
  };

  /**
   * @function _updateNotFound
   * @description Event handler for update-not-available
   */
  _updateNotFound = () => {
    this._downloadInProgress = false;

    console.error("[ElectronUpdater] - No updates available");
  }

  /**
  * @function _updateAvailable
  * @description Event handler for update-available
  */
  _updateAvailable = (info) => {
    console.log(`[ElectronUpdater] - A new version ${info.version} is available`);
  }

  /**
   * @function _handleErrorOnUpdate
   * @description Event handler for error event
   */
  _handleErrorOnUpdate = (event) => {
    this._downloadInProgress = false;

    console.error(`[ElectronUpdater] - Error while updating the application ${event}`);
  }

  /**
   * @function _handleDownloadInProgress
   * @description Event handler for download-progress
   */
  _handleDownloadInProgress = (progressInfo) => {
    this._downloadInProgress = true;

    console.log(`[ElectronUpdater] - Download Progress: ${progressInfo.percent}`);
  }

  /**
   * @function _handleDownloadCompleted
   * @description Event handler for download-completed
   */
  _handleDownloadCompleted = () => {
    this._downloadInProgress = false;
    console.log("[ElectronUpdater] - Download compleated");

    if (this._allowAutoUpdate) {
      autoUpdater.quitAndInstall();
      process.exit(0);
    }
  }
}

export default new ElectronUpdater();
