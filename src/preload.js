const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  installSteam: () => ipcRenderer.send('install-steam'),
  launchSteam: () => ipcRenderer.send('launch-steam'),
  onLog: (callback) => ipcRenderer.on('log', (_event, value) => callback(value)),
});
