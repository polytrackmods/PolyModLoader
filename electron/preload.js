const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electron", {
  quit: () => ipcRenderer.send("quit"),
  addFullscreenChangeListener: (e) =>
    ipcRenderer.on("fullscreen-change", () => e()),
  isFullscreen: () => ipcRenderer.sendSync("is-fullscreen"),
  setFullscreen: (e) => ipcRenderer.send("set-fullscreen", e),
  getArgv: () => ipcRenderer.sendSync("get-argv"),
  log: (e) => ipcRenderer.send("log-message", e),
});
