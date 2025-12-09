// electron/main.cjs
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// 🔹 If this is defined, we'll load the Vite dev server.
// If not, we assume "prod" and load dist/index.html.
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || null;

let mainWindow = null;

// ----------------------
// Config file (per machine) in userData
// ----------------------
const configPath = path.join(app.getPath("userData"), "pamela-config.json");

function loadConfig() {
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveConfig(cfg) {
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save config:", e);
  }
}

// IPC: get server URL
ipcMain.handle("config:getServerUrl", async () => {
  const cfg = loadConfig();
  return cfg.serverUrl || null;
});

// IPC: set server URL
ipcMain.handle("config:setServerUrl", async (_event, url) => {
  const cfg = loadConfig();
  cfg.serverUrl = url;
  saveConfig(cfg);
  return true;
});

// ----------------------
// Window + menu
// ----------------------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1980,
    height: 1024,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (DEV_SERVER_URL) {
    // 🔹 DEV MODE: Vite dev server
    mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // 🔹 PROD MODE: built SPA
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  setupMenu();
}

function setupMenu() {
  const template = [
    {
      label: "View",
      submenu: [
        { role: "reload" },        // Ctrl+R / Cmd+R
        { role: "forcereload" },
        { type: "separator" },
        { role: "toggledevtools" } // Ctrl+Shift+I
      ],
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
