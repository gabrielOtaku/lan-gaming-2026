import { loadJSON, saveJSON } from './persist.js';

// Ticket d'Or + dons Twitch natifs (saisis manuellement en admin) — deux
// canaux de levée de fonds distincts du don en ligne, qui vit entièrement
// dans Supabase (donation_campaigns / record_paid_donation, voir le guide
// Supabase/Stripe/Twitch). Chargé une fois au démarrage, partagé en mémoire.
const state = loadJSON('cagnotte.json', {
  twitchTotal: 0,     // dons reçus directement via le panneau natif Twitch — hors de portée d'un webhook
  ticketOrTotal: 0,
  ticketOrSold: 0,
  ticketOrPot: 0,
  ticketOrPrice: 10,
  lastUpdated: new Date().toISOString(),
});

function persist() {
  state.lastUpdated = new Date().toISOString();
  saveJSON('cagnotte.json', state);
}

export function getCagnotteState() {
  return state;
}

export function recordTicketOr({ qty, total }) {
  state.ticketOrSold += qty;
  state.ticketOrPot += total;
  state.ticketOrTotal += total;
  persist();
}

export function adminUpdateCagnotte({ twitchTotal, ticketOrPrice }) {
  if (twitchTotal !== undefined) state.twitchTotal = twitchTotal;
  if (ticketOrPrice !== undefined) state.ticketOrPrice = ticketOrPrice;
  persist();
}
