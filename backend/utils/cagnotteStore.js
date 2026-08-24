import { randomUUID } from 'node:crypto';
import { loadJSON, saveJSON } from './persist.js';

// Source unique de la cagnotte — chargée une fois au démarrage du process et
// partagée en mémoire par tous les modules qui l'importent (donations Stripe,
// Ticket d'Or, admin). Persistée sur disque à chaque écriture.
const state = loadJSON('cagnotte.json', {
  totalRaised: 0,
  donationsTotal: 0, // dons Stripe confirmés par webhook — jamais incrémenté ailleurs
  donorCount: 0,
  twitchTotal: 0,     // dons reçus directement via le panneau natif Twitch — saisi manuellement en admin, hors de portée d'un webhook
  ticketOrTotal: 0,
  ticketOrSold: 0,
  ticketOrPot: 0,
  ticketOrPrice: 10,
  goal: 100000,
  lastUpdated: new Date().toISOString(),
  recentDonations: [],
});

function persist() {
  state.totalRaised = state.donationsTotal + state.twitchTotal + state.ticketOrTotal;
  state.lastUpdated = new Date().toISOString();
  saveJSON('cagnotte.json', state);
}

export function getCagnotteState() {
  return state;
}

// Vue publique — un message de donateur non encore approuvé ne doit jamais
// quitter le serveur, pas seulement être caché côté client (§9.4). Seule
// cette fonction doit alimenter une réponse HTTP non authentifiée.
export function getPublicCagnotteState() {
  return {
    ...state,
    recentDonations: state.recentDonations.map((d) => ({
      id: d.id,
      username: d.username,
      amount: d.amount,
      message: d.messageApproved ? d.message : null,
      at: d.at,
    })),
  };
}

export function recordTicketOr({ qty, total }) {
  state.ticketOrSold += qty;
  state.ticketOrPot += total;
  state.ticketOrTotal += total;
  persist();
}

// Appelé uniquement depuis le webhook Stripe une fois le paiement confirmé
// côté serveur — jamais depuis une route déclenchée par le navigateur (§8.5).
// Le message est stocké mais jamais affiché publiquement tant qu'un
// organisateur ne l'a pas approuvé via moderateDonation (§9.4).
export function recordStripeDonation({ amountCents, displayName, message }) {
  const amount = Math.round(amountCents / 100);
  state.donationsTotal += amount;
  state.donorCount += 1;
  state.recentDonations = [
    {
      id: randomUUID(),
      username: displayName || 'Anonyme',
      amount,
      message: message || null,
      messageApproved: false,
      at: new Date().toISOString(),
    },
    ...state.recentDonations,
  ].slice(0, 20);
  persist();
}

export function adminUpdateCagnotte({ twitchTotal, goal, ticketOrPrice }) {
  if (twitchTotal !== undefined) state.twitchTotal = twitchTotal;
  if (goal !== undefined) state.goal = goal;
  if (ticketOrPrice !== undefined) state.ticketOrPrice = ticketOrPrice;
  persist();
}

// action: 'approve' rend le message public sur l'overlay et le site ;
// 'hide' l'efface sans toucher au don lui-même (§11.2 — "Masquer un message
// sans toucher au don").
export function moderateDonationMessage(id, action) {
  const donation = state.recentDonations.find((d) => d.id === id);
  if (!donation) return null;
  if (action === 'approve') {
    donation.messageApproved = true;
  } else if (action === 'hide') {
    donation.message = null;
    donation.messageApproved = false;
  }
  persist();
  return donation;
}
