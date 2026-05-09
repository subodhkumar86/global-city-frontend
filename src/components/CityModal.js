import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area
} from 'recharts';
import { fetchCityHistory } from '../utils/api';
import {
  getAQIInfo, getAQIColor, getTempColor, formatNumber, formatDate,
  formatShortDate, windDirection, kmVisibility
} from '../utils/helpers';
import styles from './CityModal.module.css';

// ── Temperature Gauge ─────────────────────────────────────────────────────────
function TempGauge({ temp }) {
  const MIN = -20, MAX = 50;
  const pct   = Math.max(0, Math.min(100, ((temp - MIN) / (MAX - MIN)) * 100));
  const color = getTempColor(temp);
  return (
    <div className={styles.gaugeWrap}>
      <div className={styles.gaugeLabel}>Temperature</div>
      <div className={styles.gaugeBar}>
        <div className={styles.gaugeFill} style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
        <span className={styles.gaugeVal}>{temp}°C</span>
      </div>
      <div className={styles.gaugeRange}><span>{MIN}°C</span><span>Scale</span><span>{MAX}°C</span></div>
    </div>
  );
}

// ── AQI Badge ─────────────────────────────────────────────────────────────────
function AQIBadge({ aqi }) {
  const info = getAQIInfo(aqi?.value);
  return (
    <div className={styles.aqiBadge} style={{ borderColor: info.color, background: info.bg }}>
      <div className={styles.aqiDot} style={{ background: info.color, boxShadow: `0 0 10px ${info.color}` }} />
      <div>
        <div className={styles.aqiScore} style={{ color: info.color }}>{aqi?.value ?? '—'}</div>
        <div className={styles.aqiUnit}>/ 5 AQI</div>
        <div className={styles.aqiCat} style={{ color: info.color }}>{info.label}</div>
      </div>
    </div>
  );
}

// ── Currency Card ─────────────────────────────────────────────────────────────
function CurrencyCard({ cur }) {
  return (
    <div className={styles.currencyCard}>
      <div className={styles.currencyHeader}>
        <span className={styles.currencyCode}>{cur?.code}</span>
        <span className={styles.currencyName}>{cur?.name}</span>
      </div>
      <div className={styles.currencyRates}>
        <div className={styles.rateRow}>
          <span className={styles.rateLabel}>1 {cur?.code} =</span>
          <span className={styles.rateVal} style={{ color: 'var(--green)' }}>
            ₹{cur?.rate_to_inr != null ? cur.rate_to_inr.toFixed(2) : 'N/A'}
          </span>
        </div>
        <div className={styles.rateRow}>
          <span className={styles.rateLabel}>1 ₹ (INR) =</span>
          <span className={styles.rateVal}>
            {cur?.inr_to_local != null ? `${cur.inr_to_local.toFixed(4)} ${cur?.code}` : 'N/A'}
          </span>
        </div>
        <div className={styles.rateRow}>
          <span className={styles.rateLabel}>1 {cur?.code} =</span>
          <span className={styles.rateVal}>
            {cur?.rate_to_usd != null ? `$${cur.rate_to_usd.toFixed(4)}` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Custom Recharts Tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTip}>
      <div className={styles.chartTipDate}>{formatShortDate(label)}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 12 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function CityModal({ city, onClose }) {
  const [tab,         setTab]         = useState('overview');
  const [history,     setHistory]     = useState([]);
  const [histDays,    setHistDays]    = useState(7);
  const [loadingHist, setLoadingHist] = useState(false);

  const loadHistory = useCallback(() => {
    if (!city) return;
    setLoadingHist(true);
    fetchCityHistory(city.city, histDays)
      .then(r => setHistory(r.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHist(false));
  }, [city, histDays]);

  useEffect(() => {
    if (tab === 'trends') loadHistory();
  }, [tab, loadHistory]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!city) return null;

  const w   = city.weather   || {};
  const aqi = city.aqi       || {};
  const cur = city.currency  || {};
  const pop = city.population || {};

  const weatherIcon = w.icon
    ? `https://openweathermap.org/img/wn/${w.icon}@2x.png`
    : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.mHead}>
          <div className={styles.mHeadLeft}>
            {weatherIcon && <img src={weatherIcon} alt={w.description} className={styles.weatherIcon} />}
            <div>
              <h2 className={styles.mCity}>{city.city}</h2>
              <p className={styles.mCountry}>{city.country}</p>
              {w.description && (
                <p className={styles.mDesc} style={{ textTransform: 'capitalize' }}>{w.description}</p>
              )}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className={styles.mTs}>Updated: {formatDate(city.timestamp)}</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['overview', 'metrics', 'trends'].map(t => (
            <button
              key={t}
              className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? '📊 Overview' : t === 'metrics' ? '🔬 Metrics' : '📈 Trends'}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <div className={styles.content}>
            <TempGauge temp={w.temperature ?? 0} />

            <div className={styles.row2}>
              <AQIBadge aqi={aqi} />
              <CurrencyCard cur={cur} />
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Feels Like</span>
                <span className={styles.statVal}>{w.feels_like ?? '—'}°C</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Humidity</span>
                <span className={styles.statVal}>{w.humidity ?? '—'}%</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Wind</span>
                <span className={styles.statVal}>{w.wind_speed ?? '—'} m/s {windDirection(w.wind_deg)}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Visibility</span>
                <span className={styles.statVal}>{kmVisibility(w.visibility)}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Pressure</span>
                <span className={styles.statVal}>{w.pressure ?? '—'} hPa</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Cloud Cover</span>
                <span className={styles.statVal}>{w.clouds ?? '—'}%</span>
              </div>
            </div>

            <div className={styles.popRow}>
              <span className={styles.popLabel}>🏙 Population</span>
              <span className={styles.popVal}>{formatNumber(pop.total)}</span>
              {pop.source && <span className={styles.popSrc}>{pop.source}</span>}
            </div>
          </div>
        )}

        {/* ── Metrics Tab ── */}
        {tab === 'metrics' && (
          <div className={styles.content}>
            <p className={styles.sectionTitle}>🌡 Weather Details</p>
            <table className={styles.table}>
              <thead>
                <tr><th>Metric</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>Temperature</td><td style={{color: getTempColor(w.temperature)}}>{w.temperature ?? '—'}°C</td></tr>
                <tr><td>Feels Like</td><td>{w.feels_like ?? '—'}°C</td></tr>
                <tr><td>Humidity</td><td>{w.humidity ?? '—'}%</td></tr>
                <tr><td>Pressure</td><td>{w.pressure ?? '—'} hPa</td></tr>
                <tr><td>Wind Speed</td><td>{w.wind_speed ?? '—'} m/s ({windDirection(w.wind_deg)})</td></tr>
                <tr><td>Visibility</td><td>{kmVisibility(w.visibility)}</td></tr>
                <tr><td>Cloud Cover</td><td>{w.clouds ?? '—'}%</td></tr>
                <tr><td>Condition</td><td style={{textTransform:'capitalize'}}>{w.description || '—'}</td></tr>
              </tbody>
            </table>

            <p className={styles.sectionTitle} style={{marginTop:16}}>🌬 Air Quality</p>
            <table className={styles.table}>
              <thead>
                <tr><th>Pollutant</th><th>Value (µg/m³)</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>AQI Index</td>
                  <td style={{color: getAQIColor(aqi.value)}}>
                    {aqi.value ?? '—'} — {aqi.category || 'Unknown'}
                  </td>
                </tr>
                <tr><td>PM2.5</td><td>{aqi.pm25 ?? '—'}</td></tr>
                <tr><td>PM10</td><td>{aqi.pm10 ?? '—'}</td></tr>
                <tr><td>NO₂</td><td>{aqi.no2 ?? '—'}</td></tr>
                <tr><td>O₃ (Ozone)</td><td>{aqi.o3 ?? '—'}</td></tr>
                <tr><td>CO</td><td>{aqi.co ?? '—'}</td></tr>
                <tr><td>SO₂</td><td>{aqi.so2 ?? '—'}</td></tr>
                <tr><td>NH₃</td><td>{aqi.nh3 ?? '—'}</td></tr>
              </tbody>
            </table>

            <p className={styles.sectionTitle} style={{marginTop:16}}>💱 Currency vs INR</p>
            <table className={styles.table}>
              <thead>
                <tr><th>Pair</th><th>Rate</th></tr>
              </thead>
              <tbody>
                <tr><td>Currency Code</td><td>{cur.code || '—'}</td></tr>
                <tr><td>Currency Name</td><td>{cur.name || '—'}</td></tr>
                <tr>
                  <td>1 {cur.code} → INR</td>
                  <td style={{color:'var(--green)'}}>₹{cur.rate_to_inr?.toFixed(4) ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td>1 INR → {cur.code}</td>
                  <td>{cur.inr_to_local?.toFixed(4) ?? 'N/A'} {cur.code}</td>
                </tr>
                <tr>
                  <td>1 {cur.code} → USD</td>
                  <td>${cur.rate_to_usd?.toFixed(6) ?? 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Trends Tab ── */}
        {tab === 'trends' && (
          <div className={styles.content}>
            <div className={styles.trendControls}>
              <span className={styles.trendLabel}>Show last:</span>
              {[7, 10, 15].map(d => (
                <button
                  key={d}
                  className={`${styles.dayBtn} ${histDays === d ? styles.dayActive : ''}`}
                  onClick={() => setHistDays(d)}
                >{d} days</button>
              ))}
            </div>

            {loadingHist ? (
              <div className={styles.chartPlaceholder}>
                <div className={styles.chartSpinner} />
                <p>Loading trend data...</p>
              </div>
            ) : history.length === 0 ? (
              <div className={styles.chartEmpty}>
                <p>📭 No historical data yet.</p>
                <p>Data accumulates over time as the backend fetches every 30 minutes.</p>
              </div>
            ) : (
              <>
                <p className={styles.chartTitle}>Temperature (°C)</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ff7043" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff7043" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#172038" />
                    <XAxis dataKey="timestamp" tickFormatter={formatShortDate}
                      tick={{ fill: '#7a9cc6', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#7a9cc6', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="temperature" name="Temp °C"
                      stroke="#ff7043" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>

                <p className={styles.chartTitle} style={{marginTop:12}}>AQI Index (1–5)</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ce93d8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ce93d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#172038" />
                    <XAxis dataKey="timestamp" tickFormatter={formatShortDate}
                      tick={{ fill: '#7a9cc6', fontSize: 10 }} />
                    <YAxis domain={[1, 5]} tick={{ fill: '#7a9cc6', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="aqi" name="AQI"
                      stroke="#ce93d8" fill="url(#aqiGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>

                <p className={styles.chartTitle} style={{marginTop:12}}>Humidity (%)</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#172038" />
                    <XAxis dataKey="timestamp" tickFormatter={formatShortDate}
                      tick={{ fill: '#7a9cc6', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#7a9cc6', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="humidity" name="Humidity %"
                      stroke="#4fc3f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
