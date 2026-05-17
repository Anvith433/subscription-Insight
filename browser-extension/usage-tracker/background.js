let TRACKED_HOSTS = {
  'www.netflix.com': 'Netflix',
  'open.spotify.com': 'Spotify',
  'www.youtube.com': 'YouTube',
  'music.youtube.com': 'YouTube Music',
  'www.primevideo.com': 'Prime Video',
};

const FLUSH_ALARM = 'usage-flush';
const TRACK_ALARM = 'usage-track';

let activeServiceName = null;
let activeStartTs = null;
let activeLastPersistTs = null;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return null;
  }
}

function serviceFromUrl(url) {
  const host = hostnameFromUrl(url);
  if (!host) return null;
  return TRACKED_HOSTS[host] || null;
}

async function withStorage() {
  return chrome.storage.local.get(['usageByDate', 'backendUrl', 'authToken', 'pendingUploadKeys']);
}

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

async function fetchSupportedServices(backendUrl) {
  try {
    const response = await fetch(`${backendUrl}/api/usage/config`);
    if (!response.ok) return;
    const services = await response.json();
    const mapped = {};
    for (const item of services || []) {
      if (item?.host && item?.providerName) {
        mapped[item.host] = item.providerName;
      }
    }
    if (Object.keys(mapped).length > 0) {
      TRACKED_HOSTS = mapped;
    }
  } catch (_) {
    // Keep local map fallback from previous successful fetch.
  }
}

async function persistUsageMinutes(serviceName, minutes) {
  if (!serviceName || minutes <= 0) return;

  const data = await withStorage();
  const usageByDate = data.usageByDate || {};
  const date = todayKey();
  usageByDate[date] = usageByDate[date] || {};
  usageByDate[date][serviceName] = (usageByDate[date][serviceName] || 0) + minutes;

  await chrome.storage.local.set({ usageByDate });
}

async function trackCurrentActiveMinute() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const serviceName = activeTab?.url ? serviceFromUrl(activeTab.url) : null;
    if (!serviceName) return;

    // MV3 service workers are ephemeral; persist one minute directly on each alarm tick.
    await persistUsageMinutes(serviceName, 1);
  } catch (_) {
    // Ignore transient tab query failures.
  }
}

function elapsedMinutes(startTs) {
  if (!startTs) return 0;
  const diffMs = Date.now() - startTs;
  return Math.floor(diffMs / 60000);
}

async function persistActiveProgress() {
  if (!activeServiceName || !activeLastPersistTs) return;

  const minutes = elapsedMinutes(activeLastPersistTs);
  if (minutes <= 0) return;

  await persistUsageMinutes(activeServiceName, minutes);
  activeLastPersistTs += minutes * 60000;
}

async function stopActiveTimer() {
  if (!activeServiceName || !activeStartTs) {
    activeServiceName = null;
    activeStartTs = null;
    activeLastPersistTs = null;
    return;
  }

  await persistActiveProgress();

  activeServiceName = null;
  activeStartTs = null;
  activeLastPersistTs = null;
}

async function startTimerForService(serviceName) {
  if (!serviceName) {
    await stopActiveTimer();
    return;
  }

  if (activeServiceName === serviceName) {
    return;
  }

  await stopActiveTimer();
  activeServiceName = serviceName;
  activeStartTs = Date.now();
  activeLastPersistTs = activeStartTs;
}

async function evaluateActiveTab() {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const service = activeTab?.url ? serviceFromUrl(activeTab.url) : null;
  await startTimerForService(service);
}

async function flushToBackend() {
  await stopActiveTimer();

  const data = await withStorage();
  const usageByDate = data.usageByDate || {};
  const backendUrl = data.backendUrl || 'http://localhost:8081';
  const authToken = data.authToken || '';
  const pendingUploadKeys = data.pendingUploadKeys || {};

  if (!authToken) {
    return;
  }

  for (const [date, serviceMinutes] of Object.entries(usageByDate)) {
    pendingUploadKeys[date] = pendingUploadKeys[date] || {};
    for (const [serviceName, minutesUsed] of Object.entries(serviceMinutes)) {
      if (!minutesUsed || minutesUsed <= 0) continue;

      const idempotencyKey = pendingUploadKeys[date][serviceName] || randomId();
      pendingUploadKeys[date][serviceName] = idempotencyKey;

      try {
        const response = await fetch(`${backendUrl}/api/usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ serviceName, minutesUsed, date, idempotencyKey }),
        });

        if (response.ok) {
          usageByDate[date][serviceName] = 0;
          delete pendingUploadKeys[date][serviceName];
        }
      } catch (_) {
        // Keep buffered data in storage when backend is unreachable.
      }
    }
  }

  await chrome.storage.local.set({ usageByDate, pendingUploadKeys });
}

chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 5 });
chrome.alarms.create(TRACK_ALARM, { periodInMinutes: 1 });

chrome.tabs.onActivated.addListener(() => {
  evaluateActiveTab();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.active) return;
  evaluateActiveTab();
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await stopActiveTimer();
    return;
  }
  evaluateActiveTab();
});

chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'idle' || state === 'locked') {
    await stopActiveTimer();
  } else {
    evaluateActiveTab();
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === FLUSH_ALARM) {
    await flushToBackend();
    await evaluateActiveTab();
    return;
  }

  if (alarm.name === TRACK_ALARM) {
    await trackCurrentActiveMinute();
    await persistActiveProgress();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const data = await withStorage();
  chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 5 });
  chrome.alarms.create(TRACK_ALARM, { periodInMinutes: 1 });
  await fetchSupportedServices(data.backendUrl || 'http://localhost:8081');
  await evaluateActiveTab();
});

chrome.runtime.onInstalled.addListener(async () => {
  const data = await withStorage();
  await chrome.storage.local.set({
    backendUrl: data.backendUrl || 'http://localhost:8081',
    authToken: data.authToken || '',
    usageByDate: data.usageByDate || {},
    pendingUploadKeys: data.pendingUploadKeys || {},
  });
  chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 5 });
  chrome.alarms.create(TRACK_ALARM, { periodInMinutes: 1 });
  await fetchSupportedServices(data.backendUrl || 'http://localhost:8081');
  await evaluateActiveTab();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'FLUSH_NOW') {
    (async () => {
      try {
        await flushToBackend();
        sendResponse({ ok: true });
      } catch (error) {
        sendResponse({ ok: false, error: error?.message || 'Flush failed' });
      }
    })();
    return true;
  }

  if (message?.type !== 'LOGIN_REQUEST') {
    return;
  }

  (async () => {
    const backendUrl = (message.backendUrl || 'http://localhost:8081').trim();
    const email = (message.email || '').trim();
    const password = message.password || '';

    if (!email || !password) {
      sendResponse({ ok: false, status: 400, error: 'Enter email and password' });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        sendResponse({ ok: false, status: response.status, error: 'Login failed' });
        return;
      }

      const data = await response.json();
      const token = data?.token || '';
      sendResponse({ ok: true, status: 200, token });
    } catch (_error) {
      sendResponse({ ok: false, status: 0, error: 'Unable to reach backend' });
    }
  })();

  return true;
});
