const DEFAULT_BACKEND = 'https://userecall.app';

const statusEl = document.getElementById('status');
const messageEl = document.getElementById('message');
const notConnected = document.getElementById('notConnected');
const connectedState = document.getElementById('connectedState');
const apiTokenInput = document.getElementById('apiToken');
const backendUrlInput = document.getElementById('backendUrl');
const advancedConfig = document.getElementById('advancedConfig');
const connectBtn = document.getElementById('connectBtn');
const advancedBtn = document.getElementById('advancedBtn');
const syncBtn = document.getElementById('syncBtn');
const disconnectBtn = document.getElementById('disconnectBtn');

let showAdvanced = false;

// Load saved config and render correct state
chrome.storage.local.get(['config'], (result) => {
  const config = result.config || {};
  if (config.apiToken) {
    showConnected();
  } else {
    showNotConnected();
  }
  updateStatus();
});

// Toggle advanced URL field
advancedBtn.addEventListener('click', () => {
  showAdvanced = !showAdvanced;
  advancedConfig.style.display = showAdvanced ? 'block' : 'none';
  advancedBtn.textContent = showAdvanced ? 'Hide Advanced' : 'Advanced';
  chrome.storage.local.get(['config'], (r) => {
    backendUrlInput.value = r.config?.backendUrl || DEFAULT_BACKEND;
  });
});

// Connect account
connectBtn.addEventListener('click', () => {
  const token = apiTokenInput.value.trim();
  if (!token) {
    showMessage('Paste your API token first.', 'error');
    return;
  }
  const backendUrl = (backendUrlInput.value.trim() || DEFAULT_BACKEND).replace(/\/$/, '');
  const config = { apiToken: token, backendUrl };
  chrome.storage.local.set({ config }, () => {
    showMessage('Connected!', 'success');
    showConnected();
    updateStatus();
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
      showMessage('Sync failed — check your token.', 'error');
    }
  });
});

// Disconnect
disconnectBtn.addEventListener('click', () => {
  chrome.storage.local.remove('config', () => {
    showNotConnected();
    showMessage('Disconnected.', 'success');
    statusEl.textContent = 'Not connected';
  });
});

function showConnected() {
  notConnected.style.display = 'none';
  connectedState.style.display = 'block';
}

function showNotConnected() {
  notConnected.style.display = 'block';
  connectedState.style.display = 'none';
}

function updateStatus() {
  chrome.runtime.sendMessage({ type: 'sync-status' }, (response) => {
    const status = response?.status;
    if (!status) {
      statusEl.textContent = 'Not connected';
      statusEl.style.color = '#94a3b8';
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
  setTimeout(() => { messageEl.textContent = ''; }, 3000);
}
