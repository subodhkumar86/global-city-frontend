import React from 'react';
import { getAQIColor, getAQILabel, getTempColor } from '../utils/helpers';
import styles from './CityCards.module.css';

function SkeletonCard() {
  return <div className={styles.skeleton} />;
}

export default function CityCards({ cities, loading, onCityClick }) {
  if (loading && cities.length === 0) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {cities.map(city => {
        const temp     = city.weather?.temperature;
        const aqiVal   = city.aqi?.value;
        const aqiColor = getAQIColor(aqiVal);
        const tempColor = getTempColor(temp);

        return (
          <button
            key={city.city}
            className={styles.card}
            onClick={() => onCityClick(city)}
          >
            <div className={styles.top}>
              <div>
                <div className={styles.cityName}>{city.city}</div>
                <div className={styles.country}>{city.country}</div>
              </div>
              <div className={styles.temp} style={{ color: tempColor }}>
                {temp ?? '—'}°
              </div>
            </div>

            <div className={styles.bottom}>
              <div className={styles.aqiPill} style={{ color: aqiColor, borderColor: aqiColor + '44', background: aqiColor + '14' }}>
                <span className={styles.aqiDot} style={{ background: aqiColor }} />
                {getAQILabel(aqiVal)}
              </div>
              <span className={styles.stat}>💧{city.weather?.humidity ?? '—'}%</span>
              <span className={styles.stat}>💨{city.weather?.wind_speed ?? '—'} m/s</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
