const backendUrlInput = document.getElementById('backendUrl');
const apiKeyInput = document.getElementById('apiKey');
const syncBtn = document.getElementById('syncBtn');
const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('status');
const messageEl = document.getElementById('message');

// Load saved config
chrome.storage.local.get(['config'], (result) => {
  const config = result.config || {};
  backendUrlInput.value = config.backendUrl || 'http://localhost:3000';
  apiKeyInput.value = config.apiKey || '';
  updateStatus();
});

// Save config
saveBtn.addEventListener('click', () => {
  const config = {
    backendUrl: backendUrlInput.value.trim(),
    apiKey: apiKeyInput.value.trim(),
  };
  chrome.storage.local.set({ config }, () => {
    showMessage('Settings saved!', 'success');
  });
});

// Sync now
syncBtn.addEventListener('click', () => {
  syncBtn.disabled = true;
  syncBtn.textContent = 'Syncing...';
  chrome.runtime.sendMessage({ type: 'sync-now' }, (response) => {
    syncBtn.disabled = false;
    syncBtn.textContent = 'Sync Now';
    if (response?.ok) {
      showMessage('Sync complete!', 'success');
      updateStatus();
    } else {
      showMessage('Sync failed. Check console.', 'error');
    }
  });
});

function updateStatus() {
  chrome.runtime.sendMessage({ type: 'sync-status' }, (response) => {
    const status = response?.status;
    if (!status) {
      statusEl.textContent = 'Not configured';
      return;
    }

    if (status.error) {
      statusEl.textContent = `Error: ${status.error}`;
      statusEl.style.color = '#dc2626';
    } else if (status.syncing) {
      statusEl.textContent = 'Syncing...';
      statusEl.style.color = '#f59e0b';
    } else if (status.lastSync) {
      const date = new Date(status.lastSync);
      statusEl.textContent = `Last sync: ${date.toLocaleString()}`;
      statusEl.style.color = '#16a34a';
    } else {
      statusEl.textContent = 'Ready to sync';
      statusEl.style.color = '#64748b';
    }
  });
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = type;
  setTimeout(() => {
    messageEl.textContent = '';
  }, 3000);
}
