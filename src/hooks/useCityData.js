import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllCities } from '../utils/api';

const POLL_MS = parseInt(process.env.REACT_APP_POLL_INTERVAL) || 30000;

export function useCityData() {
  const [cities,      setCities]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown,   setCountdown]   = useState(POLL_MS / 1000);

  const pollRef      = useRef(null);
  const tickRef      = useRef(null);
  const countRef     = useRef(POLL_MS / 1000);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      setError(null);
      const result = await fetchAllCities();
      if (result.success) {
        setCities(result.data);
        setLastUpdated(new Date());
        countRef.current = POLL_MS / 1000;
        setCountdown(POLL_MS / 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    pollRef.current = setInterval(() => { load(); }, POLL_MS);

    tickRef.current = setInterval(() => {
      countRef.current = Math.max(0, countRef.current - 1);
      setCountdown(countRef.current);
    }, 1000);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(tickRef.current);
    };
  }, [load]);

  const refresh = () => load(true);

  return { cities, loading, error, lastUpdated, countdown, refresh, pollSec: POLL_MS / 1000 };
}
