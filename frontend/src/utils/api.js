import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Auth is now handled via HttpOnly cookie — no localStorage token needed.
// withCredentials: true (set above) ensures the cookie is sent on every request.

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.message ||
      'Une erreur est survenue.';
    return Promise.reject(new Error(message));
  },
);

export const getEvents = () => api.get('/events');
export const getPartners = () => api.get('/partners');
export const submitContact = (data) => api.post('/contact', data);
export const getTicketRedirect = (data) => api.post('/ticket-redirect', data);

// Ticket inventory — la version publique masque capacité/inventaire tant que
// show_capacity est désactivé (cahier §3) ; l'admin voit toujours tout.
export const getTicketsStatus = () => api.get('/tickets/status');
export const adminGetTicketsStatus = () => api.get('/admin/tickets/status');
export const adminAdjustTickets = (data) => api.post('/admin/tickets/adjust', data);

// Feature flags de la V1 publique (billetterie Coming Soon, etc. — cahier §3/§8)
export const getSiteSettings = () => api.get('/site-settings');
export const adminUpdateSiteSettings = (data) => api.post('/admin/site-settings', data);

// Tournaments
export const getTournaments = () => api.get('/tournaments');
export const getTournament = (game) => api.get(`/tournaments/${game}`);
export const registerTeam = (data) => api.post('/tournaments/register-team', data);
export const generateBracket = (game) => api.post(`/tournaments/${game}/generate`);
export const updateMatchScore = (matchId, data) => api.put(`/tournaments/match/${matchId}`, data);
export const resetTournament = (game) => api.delete(`/tournaments/${game}/reset`);
export const getCompetitors = () => api.get('/admin/competitors');

// Cagnotte — Ticket d'Or + dons Twitch natifs uniquement. Le don en ligne
// (Stripe) est lu directement depuis Supabase, voir hooks/useDonationCampaign.js.
export const getCagnotte = () => api.get('/cagnotte');
export const adminUpdateCagnotte = (data) => api.post('/admin/cagnotte/update', data);

export default api;
