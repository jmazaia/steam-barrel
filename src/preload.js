const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  installSteam: () => ipcRenderer.send("install-steam"),
  launchSteam: () => ipcRenderer.send("launch-steam"),
  quitWine: () => ipcRenderer.send("quit-wine"),
  clearCache: () => ipcRenderer.send("clear-cache"),
  removeInstallation: () => ipcRenderer.send("remove-installation"),
  removeInstallation: () => ipcRenderer.send("remove-installation"),
  onLog: (callback) =>
    ipcRenderer.on("log", (_event, value) => callback(value)),
});
