const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const WINE_PREFIX = path.join(app.getPath("home"), ".steam-wine");

function createWindow() {
  app.setName("SteamBarrel");
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, "barrel.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
    titleBarStyle: "hiddenInset",
    backgroundColor: "#0e1419",
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.loadFile("src/index.html");

  // Optional: Open DevTools in development
  // mainWindow.webContents.openDevTools();
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

function runCommand(command, args, callback, options = {}) {
  const {
    logPrefix = "",
    successMessage = "Operation completed successfully",
    errorMessage = "Operation failed",
  } = options;

  try {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, WINEDEBUG: "-all" }, // Reduce Wine debug output
    });

    let hasOutput = false;
    let errorOutput = "";

    child.stdout.on("data", (data) => {
      hasOutput = true;
      const output = data.toString();
      if (output.trim()) {
        callback(`${logPrefix}${output}`);
      }
    });

    child.stderr.on("data", (data) => {
      const output = data.toString();
      errorOutput += output;

      // Filter out common Wine warnings that aren't actual errors
      if (
        !output.includes("fixme:") &&
        !output.includes("warn:") &&
        !output.includes("err:winediag") &&
        output.trim()
      ) {
        callback(`${logPrefix}${output}`);
      }
    });

    child.on("close", (code) => {
      if (code === 0) {
        callback(`${logPrefix}${successMessage}`);
      } else {
        const errorMsg =
          errorOutput.trim() || `Process exited with code ${code}`;
        callback(`${logPrefix}Error: ${errorMsg}`);
      }
    });

    child.on("error", (error) => {
      callback(`${logPrefix}Error: ${error.message}`);
    });

    return child;
  } catch (error) {
    callback(`${logPrefix}Error: ${error.message}`);
    return null;
  }
}

ipcMain.on("install-steam", (event) => {
  const scriptPath = path.join(__dirname, "..", "scripts", "install_steam.sh");

  // Check if script exists
  if (!fs.existsSync(scriptPath)) {
    event.sender.send(
      "log",
      "Error: Install script not found at " + scriptPath
    );
    return;
  }

  event.sender.send("log", "Starting Steam installation...");
  event.sender.send(
    "log",
    "This may take several minutes depending on your internet connection."
  );

  runCommand(
    "bash",
    [scriptPath],
    (output) => {
      event.sender.send("log", output);
    },
    {
      logPrefix: "[INSTALL] ",
      successMessage: "Steam installation completed successfully!",
      errorMessage: "Steam installation failed",
    }
  );
});

ipcMain.on("launch-steam", (event) => {
  const steamPath = path.join(
    WINE_PREFIX,
    "drive_c",
    "Program Files (x86)",
    "Steam",
    "steam.exe"
  );

  // Check if Steam is installed
  if (!fs.existsSync(steamPath)) {
    event.sender.send(
      "log",
      "Error: Steam not found. Please install Steam first."
    );
    return;
  }

  // Check if Wine is available
  runCommand(
    "which",
    ["wine"],
    (output) => {
      if (output.includes("Error") || output.includes("not found")) {
        event.sender.send(
          "log",
          "Error: Wine not found. Please install Wine first."
        );
        return;
      }

      event.sender.send("log", "Launching Steam...");
      event.sender.send("log", "Steam may take a moment to start up.");

      runCommand(
        "wine",
        [steamPath],
        (output) => {
          event.sender.send("log", output);
        },
        {
          logPrefix: "[STEAM] ",
          successMessage: "Steam launched successfully!",
          errorMessage: "Failed to launch Steam",
        }
      );
    },
    {
      logPrefix: "[WINE] ",
      successMessage: "Wine is available",
      errorMessage: "Wine check failed",
    }
  );
});

ipcMain.on("quit-wine", (event) => {
  event.sender.send("log", "Stopping all Wine processes...");

  // First try graceful shutdown
  runCommand(
    "wineserver",
    ["-k"],
    (output) => {
      event.sender.send("log", `[WINE] ${output}`);

      // Then force kill any remaining processes
      setTimeout(() => {
        runCommand(
          "pkill",
          ["-f", "wine"],
          (output) => {
            if (
              output.includes("Error") &&
              !output.includes("no process found")
            ) {
              event.sender.send("log", `[KILL] ${output}`);
            } else {
              event.sender.send("log", "[KILL] All Wine processes stopped");
            }
          },
          {
            logPrefix: "[KILL] ",
            successMessage: "Wine processes terminated",
            errorMessage: "Some processes may still be running",
          }
        );
      }, 2000);
    },
    {
      logPrefix: "[WINE] ",
      successMessage: "Wine server stopped gracefully",
      errorMessage: "Wine server shutdown failed",
    }
  );
});

ipcMain.on("clear-cache", (event) => {
  event.sender.send("log", "Clearing Steam cache...");

  const cacheLocations = [
    path.join(
      WINE_PREFIX,
      "drive_c",
      "users",
      "steam",
      "AppData",
      "Local",
      "Steam",
      "htmlcache"
    ),
    path.join(
      WINE_PREFIX,
      "drive_c",
      "users",
      "steam",
      "AppData",
      "Local",
      "Steam",
      "config",
      "htmlcache"
    ),
    path.join(
      WINE_PREFIX,
      "drive_c",
      "users",
      "steam",
      "Local Settings",
      "Application Data",
      "Steam",
      "htmlcache"
    ),
  ];

  let completedOperations = 0;
  const totalOperations = cacheLocations.length;

  cacheLocations.forEach((cachePath, index) => {
    const command = `rm -rf "${cachePath}"`;

    runCommand(
      "bash",
      ["-c", command],
      (output) => {
        completedOperations++;

        if (output.includes("Error")) {
          event.sender.send(
            "log",
            `[CACHE] Warning: Could not clear cache at ${cachePath}`
          );
        } else {
          event.sender.send(
            "log",
            `[CACHE] Cleared cache location ${index + 1}/${totalOperations}`
          );
        }

        if (completedOperations === totalOperations) {
          event.sender.send("log", "[CACHE] Steam cache cleared successfully!");
        }
      },
      {
        logPrefix: "[CACHE] ",
        successMessage: `Cache location ${index + 1} cleared`,
        errorMessage: `Failed to clear cache location ${index + 1}`,
      }
    );
  });
});

ipcMain.on("remove-installation", (event) => {
  event.sender.send("log", "Removing Steam installation...");
  event.sender.send("log", "This will delete all Steam data and games.");

  // First stop all Wine processes
  runCommand("wineserver", ["-k"], (output) => {
    event.sender.send("log", `[CLEANUP] ${output}`);

    setTimeout(() => {
      runCommand("pkill", ["-f", "wine"], (output) => {
        event.sender.send("log", `[CLEANUP] Stopped Wine processes`);

        // Now remove the Wine prefix
        const commands = [
          `rm -rf "${WINE_PREFIX}"`,
          `rm -f "${WINE_PREFIX}.backup"`,
          `rm -f "${path.join(WINE_PREFIX, "steam.done")}"`,
        ];

        let completedCommands = 0;
        const totalCommands = commands.length;

        commands.forEach((cmd, index) => {
          runCommand(
            "bash",
            ["-c", cmd],
            (output) => {
              completedCommands++;

              if (output.includes("Error")) {
                event.sender.send("log", `[REMOVE] Warning: ${output}`);
              } else {
                event.sender.send(
                  "log",
                  `[REMOVE] Cleanup step ${
                    index + 1
                  }/${totalCommands} completed`
                );
              }

              if (completedCommands === totalCommands) {
                event.sender.send(
                  "log",
                  "[REMOVE] Steam installation removed successfully!"
                );
              }
            },
            {
              logPrefix: "[REMOVE] ",
              successMessage: `Removal step ${index + 1} completed`,
              errorMessage: `Removal step ${index + 1} failed`,
            }
          );
        });
      });
    }, 1000);
  });
});
