// import axios from 'axios';

// // const API_URL = import.meta.env.VITE_API_URL || '/api';
// const API_URL = 'http://localhost:5000/api';
import axios from 'axios';

// Ensure this matches your running backend port
// const API_URL = 'http://localhost:5000/api';
// const API_URL = 'http://localhost:5000/api';
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ENTRIES
export const entriesAPI = {
  create: (data) => api.post('/entries', data),
  getAll: (params) => api.get('/entries', { params }),
  getToday: () => api.get('/entries/today'),
  getStats: (days = 7) => api.get('/entries/stats', { params: { days } }),
  getCalendar: (months = 3) => api.get('/entries/calendar', { params: { months } })
};

// AI
export const aiAPI = {
  analyzeJournal: (data) => api.post('/ai/analyze-journal', data),
  chat: (data) => api.post('/ai/chat', data),
  getDailySummary: (data) => api.post('/ai/daily-summary', data)
};

// POMODORO
export const pomodoroAPI = {
  logSession: (data) => api.post('/pomodoro/session', data),
  getStats: () => api.get('/pomodoro/stats')
};

// BREATHING
export const breathingAPI = {
  logSession: () => api.post('/breathing/session'),
  getStats: () => api.get('/breathing/stats')
};

// ACHIEVEMENTS
export const achievementsAPI = {
  getAll: () => api.get('/achievements')
};

export default api;