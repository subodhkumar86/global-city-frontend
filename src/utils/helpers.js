export const AQI_MAP = {
  1: { label: 'Good',      color: '#00e676', bg: '#00e67614' },
  2: { label: 'Fair',      color: '#ffd54f', bg: '#ffd54f14' },
  3: { label: 'Moderate',  color: '#ffa726', bg: '#ffa72614' },
  4: { label: 'Poor',      color: '#ef5350', bg: '#ef535014' },
  5: { label: 'Very Poor', color: '#ce93d8', bg: '#ce93d814' }
};

export const getAQIInfo  = (v) => AQI_MAP[v] || { label: 'Unknown', color: '#666', bg: '#66666614' };
export const getAQIColor = (v) => getAQIInfo(v).color;
export const getAQILabel = (v) => getAQIInfo(v).label;

export const getTempColor = (t) => {
  if (t === null || t === undefined) return '#888';
  if (t < 0)   return '#90caf9';
  if (t < 10)  return '#64b5f6';
  if (t < 20)  return '#4dd0e1';
  if (t < 28)  return '#81c784';
  if (t < 35)  return '#ffb74d';
  if (t < 42)  return '#ff7043';
  return '#ef5350';
};

export const formatNumber = (n) => {
  if (!n) return 'N/A';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

export const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatShortDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const windDirection = (deg) => {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8] || '—';
};

export const kmVisibility = (m) => {
  if (!m) return '—';
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
};
