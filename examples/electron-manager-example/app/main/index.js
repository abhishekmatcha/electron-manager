import { app } from 'electron';
import path from 'path';
import electronManager from '../../../../lib';

const windowManager = electronManager.windowManager;

class ExampleApp {
  constructor() {
    this.mainWindow = null;

    app.on('ready', this.createMainWindow);

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') { app.quit(); }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) { this.createMainWindow(); }
    });

    windowManager.init({ windowUrlPath: app.getAppPath() });
  }

  /**
   * @function createMainWindow
   * @description Create main window.
   */
  createMainWindow = () => {
    this.mainWindow = windowManager.createWindow({
      devTools: true,
      name: 'home',
      url: 'https://www.electronjs.org/docs',
      options: {
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          webviewTag: true
        }
      }
    })

    // Emitted when the window is closed.
    this.mainWindow.on('closed', () => { this.mainWindow = null; });

    this.settingsWindow = windowManager.createWindow({
      devTools: true,
      name: 'settings',
      options: {
        width: 500,
        height: 600,
        webPreferences: {
          nodeIntegration: true
        }
      }
    })

    this.settingsWindow.on('closed', () => { this.settingsWindow = null; });
  }
}

export default new ExampleApp();
