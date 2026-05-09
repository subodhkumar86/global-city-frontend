import React from 'react';
import { formatDate } from '../utils/helpers';
import styles from './Header.module.css';

export default function Header({ lastUpdated, countdown, pollSec, onRefresh, loading }) {
  const pct = (countdown / pollSec) * 100;
  const r   = 16;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.globe}>🌍</div>
        <div>
          <h1 className={styles.title}>Global City Insights</h1>
          <p className={styles.sub}>Real-Time World Data Dashboard</p>
        </div>
      </div>

      <div className={styles.controls}>
        {lastUpdated && (
          <div className={styles.updated}>
            <span className={styles.updatedLabel}>Last synced</span>
            <span className={styles.updatedVal}>{formatDate(lastUpdated)}</span>
          </div>
        )}

        <div className={styles.countdown}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r={r} fill="none" stroke="#172038" strokeWidth="3" />
            <circle
              cx="20" cy="20" r={r}
              fill="none"
              stroke="#00e676"
              strokeWidth="3"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
              style={{ transition: 'stroke-dasharray 0.9s linear' }}
            />
          </svg>
          <div className={styles.countdownText}>
            <span className={styles.countdownNum}>{countdown}s</span>
            <span className={styles.countdownLabel}>refresh</span>
          </div>
        </div>

        <button className={styles.refreshBtn} onClick={onRefresh} disabled={loading}>
          <span className={loading ? styles.spin : ''}>↻</span>
          {loading ? 'Loading' : 'Refresh'}
        </button>
      </div>
    </header>
  );
}
