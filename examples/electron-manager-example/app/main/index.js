// Modules to control application life and create native browser window
import { app, BrowserWindow } from 'electron';
import path from 'path';

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
  }

  /**
   * @function createMainWindow
   * @description Create main window.
   */
  createMainWindow = () => {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      }
    });

    this.mainWindow.loadFile(path.join(app.getAppPath(), 'home.html'));

    // Open the DevTools.
    this.mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    this.mainWindow.on('closed', () => { this.mainWindow = null; });

    this.settingsWindow = new BrowserWindow({
      width: 500,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      }
    });

    this.settingsWindow.loadFile(path.join(app.getAppPath(), 'settings.html'));

    // Open the DevTools.
    this.settingsWindow.webContents.openDevTools()


    this.settingsWindow.on('closed', () => { this.settingsWindow = null; });
  }
}

export default new ExampleApp();
