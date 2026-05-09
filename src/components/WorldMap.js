import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getAQIColor, getAQILabel, getTempColor } from '../utils/helpers';
import styles from './WorldMap.module.css';

// Fix map size after mount
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export default function WorldMap({ cities, onCityClick }) {
  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={2}
      maxZoom={10}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
      className={styles.map}
    >
      <MapResizer />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {cities.map(city => {
        const coords = city.coordinates;
        if (!coords) return null;

        const temp     = city.weather?.temperature;
        const aqiVal   = city.aqi?.value;
        const aqiColor = getAQIColor(aqiVal);
        const tempColor = getTempColor(temp);

        return (
          <CircleMarker
            key={city.city}
            center={[coords.lat, coords.lon]}
            radius={13}
            pathOptions={{
              color:       aqiColor,
              fillColor:   tempColor,
              fillOpacity: 0.85,
              weight:      2.5
            }}
            eventHandlers={{ click: () => onCityClick(city) }}
          >
            <LeafletTooltip direction="top" offset={[0, -18]} opacity={0.97}>
              <div className={styles.tooltip}>
                <div className={styles.tooltipCity}>{city.city}</div>
                <div className={styles.tooltipCountry}>{city.country}</div>
                <div className={styles.tooltipRow}>
                  <span style={{ color: tempColor }}>🌡 {temp ?? '—'}°C</span>
                  <span className={styles.tooltipDivider}>·</span>
                  <span style={{ color: aqiColor }}>AQI {aqiVal ?? '—'} ({getAQILabel(aqiVal)})</span>
                </div>
                <div className={styles.tooltipHint}>Click for full details</div>
              </div>
            </LeafletTooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
