const installBtn = document.getElementById('install-btn');
const launchBtn = document.getElementById('launch-btn');
const logOutput = document.getElementById('log-output');

installBtn.addEventListener('click', () => {
  window.electronAPI.installSteam();
});

launchBtn.addEventListener('click', () => {
  window.electronAPI.launchSteam();
});

window.electronAPI.onLog((log) => {
  logOutput.textContent += log;
});
