// DOM Elements
const installBtn = document.getElementById("install-btn");
const launchBtn = document.getElementById("launch-btn");
const quitBtn = document.getElementById("quit-btn");
const clearCacheBtn = document.getElementById("clear-cache-btn");
const removeInstallationBtn = document.getElementById(
  "remove-installation-btn"
);
const clearConsoleBtn = document.getElementById("clear-console-btn");

// Progress Elements
const progressSection = document.getElementById("progress-section");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const progressPercentage = document.getElementById("progress-percentage");
const progressDetails = document.getElementById("progress-details");

// Status Elements
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

// Console Elements
const consoleOutput = document.getElementById("console-output");

// State Management
let currentOperation = null;
let operationStartTime = null;

// Progress tracking for different operations
const operationSteps = {
  install: [
    "Initializing Wine environment...",
    "Downloading Steam installer...",
    "Installing Steam...",
    "Configuring Steam settings...",
    "Finalizing installation...",
  ],
  launch: [
    "Starting Wine...",
    "Loading Steam...",
    "Connecting to Steam network...",
    "Ready to play!",
  ],
  cache: [
    "Clearing Steam cache...",
    "Removing temporary files...",
    "Cache cleared successfully!",
  ],
  remove: [
    "Stopping Steam processes...",
    "Removing Wine prefix...",
    "Cleaning up files...",
    "Installation removed!",
  ],
};

// Utility Functions
function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
}

function setStatus(status, type = "ready") {
  statusText.textContent = status;
  statusDot.className = `status-dot ${type}`;
}

function updateProgress(percentage, label, details) {
  progressBar.style.width = `${percentage}%`;
  progressPercentage.textContent = `${percentage}%`;
  progressLabel.textContent = label;
  progressDetails.textContent = details;
}

function resetProgress() {
  updateProgress(0, "Ready to begin", "Select an action to get started");
}

function addConsoleMessage(message, type = "info") {
  const consoleLine = document.createElement("div");
  consoleLine.className = `console-line ${type}`;

  const timestamp = document.createElement("span");
  timestamp.className = "timestamp";
  timestamp.textContent = `[${getCurrentTime()}]`;

  const messageSpan = document.createElement("span");
  messageSpan.className = "message";
  messageSpan.textContent = message;

  consoleLine.appendChild(timestamp);
  consoleLine.appendChild(messageSpan);

  consoleOutput.appendChild(consoleLine);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
  consoleOutput.innerHTML = `
    <div class="console-line welcome">
      <span class="timestamp">[${getCurrentTime()}]</span>
      <span class="message">Console cleared. SteamBarrel ready for commands.</span>
    </div>
  `;
}

function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.classList.add("loading");
    button.disabled = true;
  } else {
    button.classList.remove("loading");
    button.disabled = false;
  }
}

function simulateProgress(operation, callback) {
  const steps = operationSteps[operation] || ["Processing..."];
  let currentStep = 0;
  let progress = 0;

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const stepProgress = ((currentStep + 1) / steps.length) * 100;
      progress = Math.min(stepProgress, progress + Math.random() * 20 + 5);

      updateProgress(
        Math.floor(progress),
        steps[currentStep],
        `Step ${currentStep + 1} of ${steps.length}`
      );

      addConsoleMessage(steps[currentStep], "info");

      if (progress >= stepProgress) {
        currentStep++;
      }
    } else {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 1000 + Math.random() * 1000);

  return interval;
}

function startOperation(operation, button) {
  if (currentOperation) {
    addConsoleMessage(
      "Another operation is in progress. Please wait.",
      "warning"
    );
    return;
  }

  currentOperation = operation;
  operationStartTime = Date.now();
  setButtonLoading(button, true);
  setStatus(
    `${operation.charAt(0).toUpperCase() + operation.slice(1)}ing...`,
    "busy"
  );

  addConsoleMessage(`Starting ${operation} operation...`, "info");

  // Start progress simulation
  simulateProgress(operation, () => {
    // This will be overridden by actual completion from main process
  });
}

function completeOperation(success = true) {
  if (!currentOperation) return;

  const duration = Math.floor((Date.now() - operationStartTime) / 1000);

  setButtonLoading(installBtn, false);
  setButtonLoading(launchBtn, false);

  if (success) {
    updateProgress(100, "Operation completed", `Finished in ${duration}s`);
    setStatus("Operation completed", "ready");
    addConsoleMessage(
      `${currentOperation} completed successfully in ${duration}s`,
      "info"
    );
  } else {
    setStatus("Operation failed", "error");
    addConsoleMessage(`${currentOperation} failed after ${duration}s`, "error");
  }

  currentOperation = null;
  operationStartTime = null;

  // Reset progress after a delay
  setTimeout(() => {
    if (!currentOperation) {
      resetProgress();
      setStatus("Ready", "ready");
    }
  }, 3000);
}

// Event Listeners
installBtn.addEventListener("click", () => {
  startOperation("install", installBtn);
  window.electronAPI.installSteam();
});

launchBtn.addEventListener("click", () => {
  startOperation("launch", launchBtn);
  window.electronAPI.launchSteam();
});

quitBtn.addEventListener("click", () => {
  addConsoleMessage("Quitting Wine processes...", "info");
  setStatus("Stopping Wine...", "busy");
  window.electronAPI.quitWine();
});

clearCacheBtn.addEventListener("click", () => {
  startOperation("cache", clearCacheBtn);
  window.electronAPI.clearCache();
});

removeInstallationBtn.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to remove the Steam installation? This cannot be undone."
    )
  ) {
    startOperation("remove", removeInstallationBtn);
    window.electronAPI.removeInstallation();
  }
});

clearConsoleBtn.addEventListener("click", () => {
  clearConsole();
});

// Handle log messages from main process
window.electronAPI.onLog((log) => {
  // Parse different types of log messages
  if (
    log.includes("Error") ||
    log.includes("error") ||
    log.includes("failed")
  ) {
    addConsoleMessage(log.trim(), "error");
    completeOperation(false);
  } else if (log.includes("Warning") || log.includes("warning")) {
    addConsoleMessage(log.trim(), "warning");
  } else if (
    log.includes("Done") ||
    log.includes("completed") ||
    log.includes("finished")
  ) {
    addConsoleMessage(log.trim(), "info");
    completeOperation(true);
  } else if (log.includes("child process exited with code")) {
    const exitCode = log.match(/code (\d+)/);
    if (exitCode && exitCode[1] !== "0") {
      addConsoleMessage(`Process exited with code ${exitCode[1]}`, "error");
      completeOperation(false);
    } else {
      addConsoleMessage("Process completed successfully", "info");
      completeOperation(true);
    }
  } else if (log.trim()) {
    addConsoleMessage(log.trim(), "info");
  }
});

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
  resetProgress();
  setStatus("Ready", "ready");
  addConsoleMessage("SteamBarrel initialized. Ready for commands.", "welcome");
});

// Add some visual feedback for button interactions
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    if (!btn.disabled) {
      btn.style.transform = "translateY(-2px)";
    }
  });

  btn.addEventListener("mouseleave", () => {
    if (!btn.disabled) {
      btn.style.transform = "translateY(0)";
    }
  });
});

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "i":
        e.preventDefault();
        if (!installBtn.disabled) installBtn.click();
        break;
      case "l":
        e.preventDefault();
        if (!launchBtn.disabled) launchBtn.click();
        break;
      case "k":
        e.preventDefault();
        clearConsole();
        break;
    }
  }
});

// Add tooltips for keyboard shortcuts
installBtn.title = "Install Steam (Ctrl+I)";
launchBtn.title = "Launch Steam (Ctrl+L)";
clearConsoleBtn.title = "Clear Console (Ctrl+K)";
