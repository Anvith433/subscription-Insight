function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const extensionApi =
  typeof chrome !== 'undefined' && chrome?.storage?.local && chrome?.runtime ? chrome : null;

function setStatus(message, timeoutMs = 1800) {
  const status = document.getElementById('status');
  if (!status) return;
  status.textContent = message;
  if (timeoutMs > 0) {
    setTimeout(() => {
      status.textContent = '';
    }, timeoutMs);
  }
}

function disableActionsWhenNotExtensionContext() {
  const saveBtn = document.getElementById('saveBtn');
  const loginBtn = document.getElementById('loginBtn');
  if (saveBtn) saveBtn.disabled = true;
  if (loginBtn) loginBtn.disabled = true;
}

function renderUsage(usageByDate) {
  const list = document.getElementById('usageList');
  const date = todayKey();
  const todayUsage = usageByDate?.[date] || {};
  const entries = Object.entries(todayUsage).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    list.innerHTML = '<li><span>No usage captured yet</span><span>0 min</span></li>';
    return;
  }

  list.innerHTML = entries
    .map(([serviceName, minutes]) => `<li><span>${serviceName}</span><span>${minutes} min</span></li>`)
    .join('');
}

async function loadData() {
  if (!extensionApi) {
    document.getElementById('backendUrl').value = 'http://localhost:8081';
    renderUsage({});
    disableActionsWhenNotExtensionContext();
    setStatus('Open this from chrome://extensions popup, not as file://', 0);
    return;
  }

  const data = await extensionApi.storage.local.get(['backendUrl', 'authToken', 'usageByDate']);
  document.getElementById('backendUrl').value = data.backendUrl || 'http://localhost:8081';
  document.getElementById('authToken').value = data.authToken || '';
  renderUsage(data.usageByDate || {});
}

async function saveData() {
  if (!extensionApi) {
    setStatus('Extension context unavailable. Reload extension and open popup.', 2200);
    return;
  }

  const backendUrl = document.getElementById('backendUrl').value.trim() || 'http://localhost:8081';
  const authToken = document.getElementById('authToken').value.trim();

  await extensionApi.storage.local.set({ backendUrl, authToken });
  setStatus('Saved', 1500);
}

async function loginAndSaveToken() {
  const backendUrl = document.getElementById('backendUrl').value.trim() || 'http://localhost:8081';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const status = document.getElementById('status');

  if (!email || !password) {
    status.textContent = 'Enter email and password';
    return;
  }

  if (!extensionApi) {
    status.textContent = 'Open this from extension popup (chrome://extensions).';
    return;
  }

  const sendLoginRequest = () =>
    new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'LOGIN_REQUEST',
          backendUrl,
          email,
          password,
        },
        (response) => {
          const runtimeError = chrome.runtime.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message));
            return;
          }
          resolve(response);
        }
      );
    });

  try {
    const result = await sendLoginRequest();

    if (!result?.ok) {
      if (result?.status === 401) {
        status.textContent = 'Invalid email or password';
      } else {
        status.textContent = result?.error || 'Login failed';
      }
      return;
    }

    const token = result?.token || '';
    if (!token) {
      status.textContent = 'Login failed';
      return;
    }

    document.getElementById('authToken').value = token;

    await extensionApi.storage.local.set({ backendUrl, authToken: token });
    status.textContent = 'Logged in and token saved';
  } catch (error) {
    const msg = (error && error.message) || '';
    if (msg.toLowerCase().includes('receiving end does not exist')) {
      status.textContent = 'Extension update pending. Reload it in chrome://extensions.';
    } else {
      status.textContent = 'Unable to reach backend. Check URL and backend status.';
    }
  }

  setTimeout(() => {
    status.textContent = '';
  }, 1800);
}

async function syncUsageNow() {
  const status = document.getElementById('status');

  if (!extensionApi) {
    status.textContent = 'Extension context unavailable.';
    return;
  }

  status.textContent = 'Syncing...';

  chrome.runtime.sendMessage(
    { type: 'FLUSH_NOW' },
    (response) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) {
        status.textContent = 'Sync failed: ' + runtimeError.message;
      } else if (response?.ok) {
        status.textContent = 'Synced successfully!';
      } else {
        status.textContent = response?.error || 'Sync failed';
      }
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
}

document.getElementById('saveBtn').addEventListener('click', saveData);
document.getElementById('loginBtn').addEventListener('click', loginAndSaveToken);
document.getElementById('syncBtn').addEventListener('click', syncUsageNow);
loadData();
