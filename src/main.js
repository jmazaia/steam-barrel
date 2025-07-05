const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const WINE_PREFIX = path.join(app.getPath("home"), ".steam-wine");

function createWindow() {
  app.setName("SteamBarrel");
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "barrel.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("src/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function runCommand(command, args, callback) {
  const child = spawn(command, args);

  child.stdout.on("data", (data) => {
    callback(data.toString());
  });

  child.stderr.on("data", (data) => {
    callback(data.toString());
  });

  child.on("close", (code) => {
    callback(`child process exited with code ${code}`);
  });
}

ipcMain.on("install-steam", (event) => {
  const scriptPath = path.join(__dirname, "..", "scripts", "install_steam.sh");
  runCommand("bash", [scriptPath], (output) => {
    event.sender.send("log", output);
  });
});

ipcMain.on("launch-steam", (event) => {
  const steamPath = path.join(
    WINE_PREFIX,
    "drive_c",
    "Program Files (x86)",
    "Steam",
    "steam.exe"
  );
  if (fs.existsSync(steamPath)) {
    runCommand("wine", [steamPath], (output) => {
      event.sender.send("log", output);
    });
  } else {
    event.sender.send("log", "Steam not found. Please install it first.");
  }
});
