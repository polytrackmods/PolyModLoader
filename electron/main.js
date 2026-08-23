const { app, BrowserWindow, session, shell, ipcMain } = require("electron");
const path = require("path");
const packageJson = require("../package.json");
let browserWindow = null;
const singleInstanceLockSucessful = app.requestSingleInstanceLock();
(singleInstanceLockSucessful
  ? app.on("second-instance", () => {
      null != browserWindow &&
        (browserWindow.isMinimized() && browserWindow.restore(),
        browserWindow.focus());
    })
  : app.quit(),
  app.on("web-contents-created", (e, n) => {
    (n.setWindowOpenHandler(
      ({ url: e }) => (
        ("https://www.kodub.com/" != e &&
          "https://opengameart.org/content/sci-fi-theme-1" != e &&
          "https://www.kodub.com/terms/polytrack" != e &&
          "https://www.kodub.com/privacy/polytrack" != e &&
          "https://www.crazygames.com/game/polytrack" != e &&
          "https://www.polymodloader.com" != e &&
          "https://www.kodub.com/discord/polytrack" != e) ||
          setImmediate(() => {
            shell.openExternal(e);
          }),
        { action: "deny" }
      ),
    ),
      n.on("will-navigate", (e, n) => {
        e.preventDefault();
      }));
  }),
  ipcMain.on("get-argv", (e) => {
    e.returnValue = process.argv;
  }),
  ipcMain.on("get-pml-port", (e) => {
    const portArg = process.argv.find((arg) => arg.startsWith("--pml-port="));
    e.returnValue = portArg ? portArg.split("=")[1] : null;
  }),
  ipcMain.on("log-message", (e, n) => {
    console.log(n);
  }),
  ipcMain.on("quit", () => {
    app.quit();
  }),
  app.on("window-all-closed", () => {
    app.quit();
  }),
  ipcMain.on("get-pml-version", (e) => {
    e.returnValue = `v${packageJson.version}-${packageJson.pmlBuild}`;
  }),
  app.whenReady().then(() => {
    const preloadPath = path.join(__dirname, "preload.js");
    console.log("Loading preload from:", preloadPath);
    ((browserWindow = new BrowserWindow({
      width: 1024,
      height: 800,
      minWidth: 320,
      minHeight: 200,
      fullscreen: !0,
      useContentSize: !0,
      autoHideMenuBar: !0,
      webPreferences: {
        devTools: !0,
        preload: path.join(__dirname, "preload.js"),
        backgroundThrottling: !1,
      },
    })),
      browserWindow.removeMenu(),
      browserWindow.webContents.on("before-input-event", (e, n) => {
        n.isAutoRepeat ||
          "keyDown" != n.type ||
          (("F11" == n.code || (n.alt && "Enter" == n.code)) &&
            (browserWindow.setFullScreen(!browserWindow.isFullScreen()),
            e.preventDefault()));
        "F12" == n.code &&
          (browserWindow.webContents.isDevToolsOpened()
            ? browserWindow.webContents.closeDevTools()
            : browserWindow.webContents.openDevTools(),
          e.preventDefault());
      }),
      browserWindow.webContents.on("will-prevent-unload", (e) => {
        e.preventDefault();
      }),
      browserWindow.on("enter-full-screen", () => {
        browserWindow.webContents.send("fullscreen-change", !0);
      }),
      browserWindow.on("leave-full-screen", () => {
        browserWindow.webContents.send("fullscreen-change", !1);
      }),
      ipcMain.on("is-fullscreen", (e) => {
        e.returnValue = browserWindow.isFullScreen();
      }),
      ipcMain.on("set-fullscreen", (e, n) => {
        browserWindow.setFullScreen(n);
      }),
      session.defaultSession.webRequest.onBeforeSendHeaders(
        { urls: ["<all_urls>"] },
        (e, n) => {
          ((e.requestHeaders.Origin =
            "https://app-polytrack-desktop.polymodloader.com"),
            n({ requestHeaders: e.requestHeaders }));
        },
      ),
      browserWindow.loadFile("index.html"));
    // browserWindow.webContents.openDevTools();
  }));
