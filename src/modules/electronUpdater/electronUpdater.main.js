/**
 * @file ElectronUpdater Main
 * Created on: 22/05/2020
 * @author Abhishek MS <abhishek.ms@hashedin.com>
 */

import { ipcMain } from 'electron';
import { autoUpdater, CancellationToken } from 'electron-updater';
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
    this.started = false;
    this.allowAutoUpdate = false;
    this.downloadInProgress = false;
    this.cancellationToken;

    // Event listeners
    ipcMain.handle(CHECK_FOR_UPDATES, this.checkForUpdates);
    ipcMain.handle(DOWNLOAD_UPDATE, this.downloadUpdates);
    ipcMain.on(CANCEL_UPDATE, this.cancelUpdate);
    ipcMain.on(AUTO_UPDATE, this.autoUpdate);
    ipcMain.on(INSTALL_UPDATES, this.installUpdates);

    this._attachEventListeners();
  }

  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function init
   * @description Initialize ElectronUpdater
   */
  init = () => {
    if (this.started) return;

    this.started = true;
  };

  /**
   * @function autoUpdate
   * @description Function to set the autoupdate, This automatically checks, downloads, install the updates.
   */
  autoUpdate = () => {
    if (process.env.NODE_ENV !== "development") {
      this.allowAutoUpdate = true;
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
      if (process.env.NODE_ENV !== "development") {
        autoUpdater.autoDownload = this.allowAutoUpdate;

        try {
          autoUpdater
            .checkForUpdates()
            .then((updateCheckResult) => {
              this.cancellationToken = updateCheckResult.cancellationToken;
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
    if (process.env.NODE_ENV !== "development") {
      if (this.cancellationToken) {
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
    if (!this.downloadInProgress) {
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
    if (process.env.NODE_ENV !== "development" && this.cancellationToken) {
      this.cancellationToken.cancel();
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
      this.cancellationToken = new CancellationToken();

      autoUpdater
        .downloadUpdate(this.cancellationToken)
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
   * @function _attachEventListeners
   * @description Attaches the auto update event listeners.
   */
  _attachEventListeners = () => {
    autoUpdater.on("update-available", (info) => {
      console.log(`[ElectronUpdater][update-available]: Update available show window ${info.version}`);
    });

    autoUpdater.on("update-not-available", () => {
      this.downloadInProgress = false;
      console.log("[ElectronUpdater]: No update Available");
    });

    autoUpdater.on("error", (event) => {
      this.downloadInProgress = false;
      console.error(`[ElectronUpdater][error]: ${event}`);
    });

    autoUpdater.on("download-progress", (progressInfo) => {
      this.downloadInProgress = true;
      console.log(`[ElectronUpdater][download-progress]: Download Progress : ${progressInfo.percent}`);
    });

    autoUpdater.on("update-downloaded", () => {
      this.downloadInProgress = false;
      console.log("[ElectronUpdater][update-downloaded]: Download compleated");

      if (this.allowAutoUpdate) {
        autoUpdater.quitAndInstall();
        process.exit(0);
      }
    });
  };
}

export default new ElectronUpdater();
