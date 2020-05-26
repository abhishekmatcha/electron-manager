/**
 * @file ElectronUpdater renderer
 * Created on: 22/05/2020
 * @author Abhishek MS <abhishek.ms@hashedin.com>
 */

import { ipcRenderer } from "electron";
import {
    CHECK_FOR_UPDATES,
    DOWNLOAD_UPDATE,
    CANCEL_UPDATE,
    INSTALL_UPDATES,
    AUTO_UPDATE
} from './constants';

class ElectronUpdater {
    checkForUpdates = () => {
        return ipcRenderer.invoke(CHECK_FOR_UPDATES);
    }

    downloadUpdates = () => {
        return ipcRenderer.invoke(DOWNLOAD_UPDATE);
    }

    installUpdates = () => {
        ipcRenderer.send(INSTALL_UPDATES);
    }

    cancelUpdate = () => {
        ipcRenderer.send(CANCEL_UPDATE);
    }

    autoUpdate = () => {
        ipcRenderer.send(AUTO_UPDATE);
    }
}

export default new ElectronUpdater();