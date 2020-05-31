import { app, ipcMain } from 'electron';
import path from 'path';
import electronManager from '../../../../lib';

const {
  logger,
  storageManager,
  windowManager
} = electronManager;

class ExampleApp {
  constructor() {
    this.mainWindow = null;
    this.settingsWindow = null;

    // Initialize modules
    electronManager.init({ isDev: true });
    windowManager.init({ windowUrlPath: app.getAppPath() });
    logger.init();

    app.on('ready', this.handleAppReady);

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') { app.quit(); }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) { this.createMainWindow(); }
    });

    // Event listeners
    ipcMain.on('OPEN_SETTINGS', this.openSettingsWindow);
  }

  /**
   * @function handleAppReady
   * @description Handle app ready event.
   */
  handleAppReady = () => {
    // Open Main window
    this.createMainWindow();

    // Create storage
    this.createStorage();
  }

  /**
   * @function createMainWindow
   * @description Create main window.
   */
  createMainWindow = () => {
    logger.init({ proxifyConsol: true });

    this.mainWindow = windowManager.createWindow({
      devTools: true,
      name: 'home',
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

    logger.error('This is a test error message from main process');
    logger.info('This is a test info message from main process');
    logger.log('This is a test log message from main process');
    logger.warn('This is a test warn message from main process');
  }

  /**
   * @function openSettingsWindow
   * @description Create settings window.
   */
  openSettingsWindow = () => {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.show();
      this.settingsWindow.focus();
      return;
    }

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

  /**
   * @function createStorage
   * @description Create storage.
   */
  createStorage = () => {
    storageManager.createStorage([
      {
        name: 'settings',
        extension: 'json',
        initialState: {}
      },
      {
        name: 'firstRunLock',
        extension: 'LOCK'
      },
      {
        name: 'settings',
        extension: 'json',
        initialState: { name: 'Sanoop' }
      },
    ])
      .then(() => {
        // Storage sample code
        // Concurrent read/write
        storageManager.write('settings', { address: '#66' })
        storageManager.write('settings', { address: '#67' })
        storageManager.read('settings')
          .then((data) => {
            console.log('StorageManager | Read1 : Success', data)
          })
          .catch((err) => {
            console.error('StorageManager | Read1 : Error', err)
          })
        storageManager.write('settings', { address: '#75' })
        storageManager.read('settings')
          .then((data) => {
            console.log('StorageManager | Read2 : Success', data)
          })
          .catch((err) => {
            console.error('StorageManager | Read2 : Error', err)
          })
      })
      .catch((err) => {
        console.error(err)
      })
  }
}

export default new ExampleApp();
