import React, { useState } from 'react';
import { useCityData } from './hooks/useCityData';
import Header    from './components/Header';
import WorldMap  from './components/WorldMap';
import CityCards from './components/CityCards';
import CityModal from './components/CityModal';
import styles from './App.module.css';

export default function App() {
  const { cities, loading, error, lastUpdated, countdown, refresh, pollSec } = useCityData();
  const [selectedCity, setSelectedCity] = useState(null);

  return (
    <div className={styles.app}>
      <Header
        lastUpdated={lastUpdated}
        countdown={countdown}
        pollSec={pollSec}
        onRefresh={refresh}
        loading={loading}
      />

      <main className={styles.main}>
        {/* ── Map ── */}
        <div className={styles.mapWrap}>
          {loading && cities.length === 0 ? (
            <div className={styles.loadScreen}>
              <div className={styles.spinner} />
              <p className={styles.loadText}>Fetching global city data…</p>
              <p className={styles.loadSub}>Connecting to backend APIs</p>
            </div>
          ) : error ? (
            <div className={styles.errorScreen}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorMsg}>{error}</p>
              <button className={styles.retryBtn} onClick={refresh}>↻ Retry</button>
            </div>
          ) : (
            <WorldMap cities={cities} onCityClick={setSelectedCity} />
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <h2 className={styles.sidebarTitle}>10 Cities</h2>
            <span className={styles.liveBadge}>● LIVE</span>
          </div>
          <CityCards cities={cities} loading={loading} onCityClick={setSelectedCity} />
        </aside>
      </main>

      {/* ── Legend ── */}
      <footer className={styles.legend}>
        <span className={styles.legendTitle}>Map Guide:</span>
        <span>🎨 Fill color = Temperature</span>
        <span>🔵 Border color = AQI level</span>
        <span>👆 Click any marker or city card for details</span>
        {loading && cities.length > 0 && <span className={styles.updatingBadge}>⟳ Updating…</span>}
      </footer>

      {/* ── Modal ── */}
      {selectedCity && (
        <CityModal city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </div>
  );
}
