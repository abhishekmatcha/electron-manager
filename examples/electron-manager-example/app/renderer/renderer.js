let { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', pageLoaded);

function pageLoaded() {
  document.getElementById("btnOpenSettings").addEventListener("click", function () {
    ipcRenderer.send('OPEN_SETTINGS');
  });
}
