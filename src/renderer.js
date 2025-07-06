const installBtn = document.getElementById('install-btn');
const launchBtn = document.getElementById('launch-btn');
const logOutput = document.getElementById('log-output');

function setLoading(button, isLoading) {
    const loader = button.querySelector('.loader');
    const span = button.querySelector('span');
    if (isLoading) {
        button.classList.add('loading');
        loader.style.display = 'block';
        span.style.display = 'none';
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        loader.style.display = 'none';
        span.style.display = 'inline';
        button.disabled = false;
    }
}

installBtn.addEventListener('click', () => {
    setLoading(installBtn, true);
    window.electronAPI.installSteam();
});

launchBtn.addEventListener('click', () => {
    setLoading(launchBtn, true);
    window.electronAPI.launchSteam();
});

window.electronAPI.onLog((log) => {
    logOutput.textContent += log;
    // Reset buttons when process is finished
    if (log.includes('Done') || log.includes('Error')) {
        setLoading(installBtn, false);
        setLoading(launchBtn, false);
    }
});
