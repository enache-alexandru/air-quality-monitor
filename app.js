const locationQueryInput = document.getElementById('locationQuery');
const thresholdInput = document.getElementById('threshold');
const pollIntervalInput = document.getElementById('pollInterval');
const soundToggle = document.getElementById('soundToggle');
const backgroundModeNote = document.getElementById('backgroundModeNote');
const saveBtn = document.getElementById('saveBtn');
const geoBtn = document.getElementById('geoBtn');
const testNotifyBtn = document.getElementById('testNotifyBtn');
const aqiValue = document.getElementById('aqiValue');
const dominantPollutant = document.getElementById('dominantPollutant');
const locationLabel = document.getElementById('locationLabel');
const updatedAt = document.getElementById('updatedAt');
const aqiBadge = document.getElementById('aqiBadge');
const statusCard = document.getElementById('statusCard');
const healthGuidance = document.getElementById('healthGuidance');
const monitoringState = document.getElementById('monitoringState');
const apiConnectionBadge = document.getElementById('apiConnectionBadge');
const apiConnectionText = document.getElementById('apiConnectionText');
const historyList = document.getElementById('historyList');
const alertList = document.getElementById('alertList');
const messageBox = document.getElementById('message');

const STORAGE_KEY = 'waqi-air-monitor-settings';
const DEFAULT_THRESHOLD = 100;
const HISTORY_LIMIT = 5;
let pollTimer = null;
let lastAlertAqi = null;
let lastKnownAqi = null;
let soundEnabled = true;
let lastAlertTimestamp = null;
let alertLog = [];
let recentHistory = [];

function showMessage(text) {
  messageBox.textContent = text;
}

function setApiConnection(state, label) {
  apiConnectionBadge.className = `connection-badge connection-${state}`;
  apiConnectionText.textContent = label;
}

function getAqiStatus(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for sensitive groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAqiClassName(status) {
  if (status === 'Good') return 'status-good';
  if (status === 'Moderate') return 'status-moderate';
  if (status === 'Unhealthy for sensitive groups') return 'status-sensitive';
  if (status === 'Unhealthy') return 'status-unhealthy';
  if (status === 'Very Unhealthy') return 'status-very-unhealthy';
  return 'status-hazardous';
}

function getAqiGuidance(status) {
  if (status === 'Good') return 'Air quality is satisfactory. Normal outdoor activity is appropriate.';
  if (status === 'Moderate') return 'Air quality is acceptable. Sensitive people may want to take extra care.';
  if (status === 'Unhealthy for sensitive groups') return 'Sensitive groups should reduce prolonged or strenuous outdoor activity.';
  if (status === 'Unhealthy') return 'Limit prolonged outdoor activity and consider wearing an appropriate mask.';
  if (status === 'Very Unhealthy') return 'Avoid outdoor activity and keep indoor air as clean as possible.';
  return 'Health emergency conditions. Stay indoors and follow local public-health guidance.';
}

function updateStatus(data) {
  const aqi = data.aqi;
  const status = getAqiStatus(aqi);
  lastKnownAqi = aqi;
  aqiValue.textContent = aqi;
  aqiBadge.textContent = status;
  aqiBadge.className = `aqi-badge ${getAqiClassName(status)}`;
  statusCard.className = `card status-card ${getAqiClassName(status)}-card`;
  healthGuidance.textContent = getAqiGuidance(status);
  dominantPollutant.textContent = data.dominantPollutant || '—';
  locationLabel.textContent = data.location || 'Unknown';
  updatedAt.textContent = data.updatedAt || new Date().toLocaleString();
  monitoringState.textContent = `Monitoring is active for ${data.location || 'your region'}.`;

  recentHistory.push({ aqi, status, updatedAt: data.updatedAt || new Date().toLocaleString() });
  recentHistory = recentHistory.slice(-HISTORY_LIMIT);
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  recentHistory.forEach(entry => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `<span>${entry.aqi}</span><small>${entry.status}</small><small>${entry.updatedAt}</small>`;
    historyList.appendChild(item);
  });

  alertList.innerHTML = '';
  alertLog.forEach(entry => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `<span>${entry.aqi}</span><small>${entry.message}</small><small>${entry.timestamp}</small>`;
    alertList.appendChild(item);
  });
}

function setSoundPreference(enabled) {
  soundEnabled = enabled;
  soundToggle.checked = enabled;
}

function playAlertSound() {
  if (!soundEnabled) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gainNode.gain.value = 0.05;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.18);
}

function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const config = JSON.parse(saved);
    locationQueryInput.value = config.location || '';
    thresholdInput.value = config.threshold || DEFAULT_THRESHOLD;
    pollIntervalInput.value = config.pollMinutes || 10;
    setSoundPreference(config.soundEnabled !== false);
  } catch (error) {
    console.warn('Failed to parse settings', error);
  }
}

function saveSettings() {
  const config = {
    location: locationQueryInput.value.trim(),
    threshold: Number(thresholdInput.value) || DEFAULT_THRESHOLD,
    pollMinutes: Number(pollIntervalInput.value) || 10,
    soundEnabled: soundToggle.checked,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  showMessage('Settings saved. Monitoring air quality now.');
  startMonitoring(config);
}

function getStoredSettings() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showMessage('Notifications are not supported in this browser.');
    return Promise.resolve('denied');
  }
  return Notification.requestPermission();
}

function notifyUser(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  playAlertSound();

  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><path fill=%22%2353c6ff%22 d=%22M12 2L2 22h20L12 2z%22/></svg>',
        vibrate: [100, 50, 100],
      });
    });
    return;
  }

  new Notification(title, {
    body,
    icon: undefined,
    vibrate: [100, 50, 100],
  });
}

async function fetchAqiByGeo(latitude, longitude) {
  const url = `/api/aqi?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;
  return fetchAqi(url);
}

async function fetchAqiByLocation(query) {
  const url = `/api/aqi?location=${encodeURIComponent(query)}`;
  return fetchAqi(url);
}

async function fetchAqi(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Network error: ${response.status}`);
  }

  if (payload.status === 'ok' && payload.data) {
    const data = payload.data;
    return {
      aqi: data.aqi,
      dominantPollutant: data.dominentpol || data.dominantpol || data.idx || '—',
      location: data.city?.name || data.station?.name || 'Current region',
      updatedAt: data.time?.s || new Date().toLocaleString(),
    };
  }

  if (payload.aqi !== undefined) {
    return {
      aqi: payload.aqi,
      dominantPollutant: payload.dominantPollutant || '—',
      location: payload.location || 'Current region',
      updatedAt: payload.updatedAt || new Date().toLocaleString(),
    };
  }

  throw new Error(payload.error || 'WAQI request failed');
}

async function updateAirQuality(config) {
  setApiConnection('connecting', 'Connecting');
  monitoringState.textContent = 'Contacting the WAQI API...';
  showMessage('Fetching air quality data...');

  try {
    let data;
    if (config.useGeo) {
      const position = await getCurrentPosition();
      data = await fetchAqiByGeo(position.coords.latitude, position.coords.longitude);
    } else if (config.location) {
      data = await fetchAqiByLocation(config.location);
    } else {
      showMessage('Enter a city name or choose "Use my location".');
      return;
    }

    updateStatus(data);
    setApiConnection('connected', 'Connected');
    monitoringState.textContent = `WAQI connection established. Monitoring ${data.location || 'your region'}.`;
    showMessage(`Last checked ${new Date().toLocaleTimeString()}.`);
    checkThreshold(config.threshold, data.aqi, config.location || 'local area');
  } catch (error) {
    console.error(error);
    setApiConnection('error', 'Disconnected');
    monitoringState.textContent = 'WAQI API connection failed.';
    showMessage(`Failed to load AQI data: ${error.message}`);
  }
}

function checkThreshold(threshold, aqi, locationName) {
  if (aqi >= threshold && lastAlertAqi !== aqi) {
    notifyUser('Air quality alert', `AQI is ${aqi} in ${locationName}. Stay safe and limit outdoor activity.`);
    lastAlertAqi = aqi;
    lastAlertTimestamp = new Date().toLocaleString();
    alertLog.unshift({
      aqi,
      message: `AQI exceeded ${threshold} in ${locationName}`,
      timestamp: lastAlertTimestamp,
    });
    alertLog = alertLog.slice(0, HISTORY_LIMIT);
    renderHistory();
  }
}

async function sendTestNotification() {
  const permissionState = await requestNotificationPermission();
  if (permissionState !== 'granted') {
    showMessage('Browser notifications are not enabled yet. Allow notifications and try again.');
    return;
  }

  const aqi = Number(lastKnownAqi ?? aqiValue.textContent);
  const locationName = locationLabel.textContent || 'your region';
  const message = Number.isFinite(aqi)
    ? `Current AQI is ${aqi} in ${locationName}.`
    : 'No AQI reading is available yet. This is a manual test notification.';

  notifyUser('AQI test notification', message);
  showMessage(`Test notification sent. ${message}`);
}

function startMonitoring(config) {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  const monitoringConfig = {
    token: config.token,
    location: config.location,
    threshold: config.threshold,
    useGeo: config.useGeo,
  };

  updateAirQuality(monitoringConfig);

  const intervalMs = (Number(config.pollMinutes) || 10) * 60 * 1000;
  pollTimer = setInterval(() => {
    updateAirQuality(monitoringConfig);
  }, intervalMs);
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not available.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
    });
  });
}

geoBtn.addEventListener('click', async () => {
  const config = getStoredSettings() || {};
  config.useGeo = true;
  config.location = '';
  config.threshold = Number(thresholdInput.value) || DEFAULT_THRESHOLD;
  config.pollMinutes = Number(pollIntervalInput.value) || 10;
  config.soundEnabled = soundToggle.checked;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  showMessage('Using your current location for air quality monitoring.');
  await requestNotificationPermission();
  startMonitoring(config);
});

saveBtn.addEventListener('click', async () => {
  const config = {
    location: locationQueryInput.value.trim(),
    threshold: Number(thresholdInput.value) || DEFAULT_THRESHOLD,
    pollMinutes: Number(pollIntervalInput.value) || 10,
    useGeo: false,
    soundEnabled: soundToggle.checked,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  await requestNotificationPermission();
  saveSettings();
});

testNotifyBtn.addEventListener('click', async () => {
  await sendTestNotification();
});

soundToggle.addEventListener('change', () => {
  setSoundPreference(soundToggle.checked);
  const saved = getStoredSettings() || {};
  saved.soundEnabled = soundToggle.checked;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    backgroundModeNote.textContent = 'Background mode active. Alerts continue as notifications while the tab is hidden.';
    return;
  }

  backgroundModeNote.textContent = 'Background mode is enabled. Alerts continue even while the tab is hidden.';
});

window.addEventListener('load', async () => {
  loadSettings();
  const config = getStoredSettings();
  if (config) {
    await requestNotificationPermission();
    startMonitoring(config);
  }

  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      await navigator.serviceWorker.register('service-worker.js?v=3');
      console.log('Service worker registered');
    } catch (error) {
      console.warn('Service worker registration failed', error);
    }
  }
});
