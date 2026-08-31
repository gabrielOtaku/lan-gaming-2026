import { loadJSON, saveJSON } from './persist.js';

// Feature flags pour la V1 publique (cahier §3) — permettent de faire
// basculer la billetterie sans redéployer. Par défaut : billetterie en
// mode "Coming Soon", aucune capacité publiée.
const state = loadJSON('siteSettings.json', {
  ticketSalesEnabled: false,
  showCapacity: false,
});

function persist() {
  saveJSON('siteSettings.json', state);
}

export function getSiteSettings() {
  return state;
}

export function updateSiteSettings({ ticketSalesEnabled, showCapacity }) {
  if (ticketSalesEnabled !== undefined) state.ticketSalesEnabled = !!ticketSalesEnabled;
  if (showCapacity !== undefined) state.showCapacity = !!showCapacity;
  persist();
  return state;
}
