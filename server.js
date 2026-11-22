require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WAQI_TOKEN = process.env.WAQI_TOKEN;

app.disable('etag');
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.svg') || req.path.endsWith('.webmanifest')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

app.use(express.static(path.join(__dirname)));

app.get('/health', (req, res) => {
  res.send('OK');
});

app.get('/api/aqi', async (req, res) => {
  const { location, lat, lon } = req.query;

  if (!WAQI_TOKEN) {
    return res.status(500).json({ error: 'WAQI_TOKEN is not configured on the server.' });
  }

  let waqiUrl = '';
  if (location) {
    waqiUrl = `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${encodeURIComponent(WAQI_TOKEN)}`;
  } else if (lat && lon) {
    waqiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${encodeURIComponent(WAQI_TOKEN)}`;
  } else {
    return res.status(400).json({ error: 'Provide either a location or latitude/longitude.' });
  }

  try {
    const response = await fetch(waqiUrl, { cache: 'no-store' });
    const payload = await response.json();

    if (payload.status !== 'ok') {
      return res.status(400).json({ error: payload.data || 'WAQI request failed.' });
    }

    return res.json({
      aqi: payload.data.aqi,
      dominantPollutant: payload.data.dominentpol || payload.data.dominantpol || payload.data.idx || '—',
      location: payload.data.city?.name || payload.data.station?.name || 'Current region',
      updatedAt: payload.data.time?.s || new Date().toLocaleString(),
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Unable to fetch AQI data.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Air Quality Monitor running at http://localhost:${PORT}`);
});
