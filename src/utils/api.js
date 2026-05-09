import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: BASE, timeout: 12000 });

export const fetchAllCities    = ()           => api.get('/cities').then(r => r.data);
export const fetchCity         = (name)       => api.get(`/cities/${encodeURIComponent(name)}`).then(r => r.data);
export const fetchCityHistory  = (name, days) => api.get(`/cities/${encodeURIComponent(name)}/history?days=${days}`).then(r => r.data);
export const triggerRefresh    = ()           => api.post('/refresh').then(r => r.data);
export const fetchStats        = ()           => api.get('/stats').then(r => r.data);

export default api;
