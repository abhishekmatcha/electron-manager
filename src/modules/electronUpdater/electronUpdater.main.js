/**
 * @file ElectronUpdater Main
 * Created on: 22/05/2020
 * @author Abhishek MS <abhishek.ms@hashedin.com>
 */

import { ipcMain } from 'electron';
import { autoUpdater, CancellationToken } from 'electron-updater';
import { isDev } from '../../utils';
import {
  AUTO_UPDATE,
  CHECK_FOR_UPDATES,
  CANCEL_UPDATE,
  DOWNLOAD_UPDATE,
  INSTALL_UPDATES,
} from './constants';

/**
 * @class ElectronUpdater
 * @description It is a wrapper on autoupdater, we can download and install the updated versions
 */
class ElectronUpdater {
  constructor() {
    this._started = false;
    this._allowAutoUpdate = false;
    this._downloadInProgress = false;
    this._cancellationToken;

    // Event listeners
    ipcMain.on(AUTO_UPDATE, this.autoUpdate);
    ipcMain.on(CANCEL_UPDATE, this.cancelUpdate);
    ipcMain.on(INSTALL_UPDATES, this.installUpdates);
    ipcMain.handle(DOWNLOAD_UPDATE, this.downloadUpdates);
    ipcMain.handle(CHECK_FOR_UPDATES, this.checkForUpdates);
    
    autoUpdater.on('error', this._handleErrorOnUpdate);
    autoUpdater.on('update-available', this._updateAvailable);
    autoUpdater.on('update-not-available', this._updateNotFound);
    autoUpdater.on('update-downloaded', this._handleDownloadCompleted);
    autoUpdater.on('download-progress', this._handleDownloadInProgress);
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @description Initialize ElectronUpdater
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
    if (!isDev()) {
      this._allowAutoUpdate = true;
      this.checkForUpdates();
    } else {
      console.log(`[ElectronUpdater][autoUpdate]: autoUpdate can't be set in development mode `);
    }
  };

  /**
   * @function checkForUpdates
   * @description Function to check if any updates available, if available it returns a resolved promise else rejects.
   */
  checkForUpdates = () => {
    return new Promise((resolve, reject) => {
      if (!isDev()) {
        autoUpdater.autoDownload = this._allowAutoUpdate;

        try {
          autoUpdater
            .checkForUpdates()
            .then((updateCheckResult) => {
              this._cancellationToken = updateCheckResult.cancellationToken;
              return resolve();
            })
            .catch((exception) => {
              throw exception;
            });
        } catch (err) {
          console.error(`[ElectronUpdater][checkForUpdates]: Unable to check for update: \n${err.message}`);
          return reject();
        }
      } else {
        console.log(`[ElectronUpdater][checkForUpdats]: autoUpdates wont work in development mode `);
        return reject();
      }
    });
  };

  /**
   * @function downloadUpdates
   * @description Function to download the available update.
   */
  downloadUpdates = () => {
    if (!isDev()) {
      if (this._cancellationToken) {
        return this._downloadUpdate();
      } else {
        this.checkForUpdates()
          .then(() => {
            return this._downloadUpdate();
          })
          .catch(() => {
            return Promise.reject();
          });
      }
    } else {
      console.log(`[ElectronUpdater][downloadUpdates]: Unable to download in development mode `);
      return Promise.reject();
    }
  };

  /**
   * @function installUpdates
   * @description Function to install the downloaded update.
   */
  installUpdates = () => {
    if (!this._downloadInProgress) {
      autoUpdater.quitAndInstall();
      process.exit(0);
    } else {
      console.log(`[ElectronUpdater][installUpdates]: Currently download is in progress, please call this method after downloading the update`);
    }
  };

  /**
   * @function cancelUpdate
   * @description Function to cancel the installing update.
   */
  cancelUpdate = () => {
    if (!isDev() && this._cancellationToken) {
      this._cancellationToken.cancel();
    } else {
      console.log(`[ElectronUpdater][cancelUpdates]: Unable to cancel updates`);
    }
  };

  /* ****************************************************************************/
  // Private Methods
  /* ****************************************************************************/

  /**
   * @function _downloadUpdate
   * @description Function to download the available update.
   */
  _downloadUpdate = () => {
    return new Promise((resolve, reject) => {
      this._cancellationToken = new CancellationToken();

      autoUpdater
        .downloadUpdate(this._cancellationToken)
        .then((data) => {
          return resolve(data);
        })
        .catch((exception) => {
          console.error(`[ElectronUpdater][downloadUpdate]: Caught an exception while downloading update ${exception.message}`);
          this.cancelUpdate();

          return reject();
        });
    });
  };

  /**
   * @function _updateNotFound
   * @description Event handler for update-not-available
   */
  _updateNotFound = () =>{
    this._downloadInProgress = false;

    console.log("[ElectronUpdater]: No update Available");
  }

  /**
  * @function _updateAvailable
  * @description Event handler for update-available
  */
  _updateAvailable = (info) => {
    console.log(`[ElectronUpdater][update-available]: Update available show window ${info.version}`);
  }

  /**
   * @function _handleErrorOnUpdate
   * @description Event handler for error event
   */
  _handleErrorOnUpdate = (event) => {
    this._downloadInProgress = false;

    console.error(`[ElectronUpdater][error]: ${event}`);
  }

  /**
   * @function _handleDownloadInProgress
   * @description Event handler for download-progress
   */
  _handleDownloadInProgress = (progressInfo) => {
    this._downloadInProgress = true;

    console.log(`[ElectronUpdater][download-progress]: Download Progress : ${progressInfo.percent}`);
  }

  /**
   * @function _handleDownloadCompleted
   * @description Event handler for download-completed
   */
  _handleDownloadCompleted = () => {
    this._downloadInProgress = false;
    console.log("[ElectronUpdater][update-downloaded]: Download compleated");

    if (this._allowAutoUpdate) {
      autoUpdater.quitAndInstall();
      process.exit(0);
    }
  }
}

export default new ElectronUpdater();
