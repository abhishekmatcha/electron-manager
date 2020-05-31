let { ipcRenderer } = require('electron');
let { logger } = require('../../../../lib');

document.addEventListener('DOMContentLoaded', pageLoaded);

function pageLoaded() {
  logger.error('This is a test error message from renderer process');
  logger.info('This is a test info message from renderer process');
  logger.log('This is a test log message from renderer process');
  logger.warn('This is a test warn message from renderer process');

  document.getElementById("btnOpenSettings").addEventListener("click", function () {
    ipcRenderer.send('OPEN_SETTINGS');
  });
}
