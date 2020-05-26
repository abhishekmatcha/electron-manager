/**
 * @file ElectronUpdater renderer
 * Created on: 22/05/2020
 * @author Abhishek MS <abhishek.ms@hashedin.com>
 */

import { ipcRenderer } from "electron";
import {
  AUTO_UPDATE,
  CHECK_FOR_UPDATES,
  CANCEL_UPDATE,
  DOWNLOAD_UPDATE,
  INSTALL_UPDATES,
} from "./constants";

class ElectronUpdater {
  /* ****************************************************************************/
  // Instance Methods
  /* ****************************************************************************/
  
  /**
   * @function checkForUpdates
   * @description Function to check if any updates available, if available it returns a resolved promise else rejects.
   */
  checkForUpdates = () => {
    return ipcRenderer.invoke(CHECK_FOR_UPDATES);
  };

  /**
   * @function downloadUpdates
   * @description Function to download the available update.
   */
  downloadUpdates = () => {
    return ipcRenderer.invoke(DOWNLOAD_UPDATE);
  };

  /**
   * @function installUpdates
   * @description Function to install the downloaded update.
   */
  installUpdates = () => {
    ipcRenderer.send(INSTALL_UPDATES);
  };

  /**
   * @function cancelUpdate
   * @description Function to cancel the installing update.
   */
  cancelUpdate = () => {
    ipcRenderer.send(CANCEL_UPDATE);
  };

  /**
   * @function autoUpdate
   * @description Function to set the autoupdate, This automatically checks, downloads, install the updates.
   */
  autoUpdate = () => {
    ipcRenderer.send(AUTO_UPDATE);
  };
}

export default new ElectronUpdater();
