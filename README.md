# Global City Insights — Frontend

React dashboard with interactive world map showing real-time weather, AQI, and city data.

## Tech Stack
- **React 18** — UI framework
- **React-Leaflet + Leaflet** — Interactive world map with city markers
- **Recharts** — Trend/history charts (temperature, AQI, humidity)
- **Axios** — API calls with 30-second polling
- **CSS Modules** — Scoped component styling
- **Google Fonts** — Outfit (display) + DM Mono (data)

## Features

- 🗺 **Interactive 2D world map** (dark CARTO tiles) with 10 clickable city markers
  - Marker fill color = temperature (blue→green→yellow→red scale)
  - Marker border color = AQI level (green=good → purple=very poor)
  - Hover tooltip with temperature and AQI summary
- 📊 **City detail modal** with 3 tabs:
  - **Overview**: Temperature gauge, AQI badge, currency vs INR card, weather stats grid, population
  - **Metrics**: Full data table (weather + 8 air pollutants + currency rates)
  - **Trends**: Area/line charts for temperature, AQI, humidity over 7/10/15 days
- ⏱ **Auto-polling every 30 seconds** with visual countdown ring
- 📱 **Mobile responsive** (stacks map on top, cards below)
- 💀 **Skeleton loaders** and proper error states

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Backend running (see global-city-backend README)

### 2. Installation

```bash
cd global-city-frontend
npm install

cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_POLL_INTERVAL=30000
```

### 3. Run

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

The `"proxy": "http://localhost:5000"` in `package.json` forwards API calls automatically in development — you don't need `REACT_APP_API_URL` if the backend is on port 5000.

## Deploy to Vercel

```bash
npm run build
vercel --prod
```

In Vercel dashboard, set:
```
REACT_APP_API_URL = https://your-backend.vercel.app/api
```

## Folder Structure

```
src/
  App.js / App.module.css       ← Root layout
  components/
    Header.js / .module.css     ← Title + countdown + refresh button
    WorldMap.js / .module.css   ← Leaflet map with CircleMarkers
    CityCards.js / .module.css  ← Sidebar city list
    CityModal.js / .module.css  ← Detail modal (tabs + charts)
  hooks/
    useCityData.js              ← Polling hook (30s interval)
  utils/
    api.js                      ← Axios API helpers
    helpers.js                  ← Colors, formatters, AQI map
```
