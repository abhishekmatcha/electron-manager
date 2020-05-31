/**
 * @class ElectronUpdater
 * @description ElectronUpdater module for renderer process
 * @author Abhishek MS <abhishek.ms@hashedin.com>
 * Created on: 22/05/2020
 */

import { ipcRenderer } from "electron";
import * as CONSTANTS from "./constants";

class ElectronUpdater {
  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/

  /**
   * @function checkForUpdates
   * @description Function to check if any updates available, if available it returns a resolved promise else rejects.
   * @returns {Promise} resolve if update is available, else reject.
   */
  checkForUpdates = () => {
    return ipcRenderer.invoke(CONSTANTS.CHECK_FOR_UPDATES);
  };

  /**
   * @function downloadUpdates
   * @description Function to download the available update.
   * @returns {Promise} resolve if starts the download, else reject.
   */
  downloadUpdates = () => {
    return ipcRenderer.invoke(CONSTANTS.DOWNLOAD_UPDATE);
  };

  /**
   * @function installUpdates
   * @description Function to install the downloaded update.
   */
  installUpdates = () => {
    ipcRenderer.send(CONSTANTS.INSTALL_UPDATES);
  };

  /**
   * @function cancelUpdate
   * @description Function to cancel the installing update.
   */
  cancelUpdate = () => {
    ipcRenderer.send(CONSTANTS.CANCEL_UPDATE);
  };

  /**
   * @function autoUpdate
   * @description Function to set the autoupdate, This automatically checks, downloads, install the updates.
   */
  autoUpdate = () => {
    ipcRenderer.send(CONSTANTS.AUTO_UPDATE);
  };
}

export default new ElectronUpdater();
