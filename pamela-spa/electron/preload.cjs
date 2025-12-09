// electron/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getServerUrl: () => ipcRenderer.invoke("config:getServerUrl"),
  setServerUrl: (url) => ipcRenderer.invoke("config:setServerUrl", url),
});
