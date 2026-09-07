import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import { validateContact, validateTicketRequest, validateChat } from '../middlewares/validate.js';
import { sanitizeObject, sanitizeString } from '../utils/sanitize.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import { loadJSON, saveJSON } from '../utils/persist.js';
import {
  getCagnotteState, recordTicketOr, adminUpdateCagnotte,
} from '../utils/cagnotteStore.js';
import { getSiteSettings, updateSiteSettings } from '../utils/siteSettingsStore.js';

// ── Nodemailer transporter ────────────────────────────────────────────────────
const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'votre.email@gmail.com';
const mailer = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

// Gemini API key must start with "AIzaSy" — reject obviously wrong keys
const rawKey = process.env.GEMINI_API_KEY;
const validKey = rawKey && rawKey.startsWith('AIzaSy') ? rawKey : null;
const genAI = validKey ? new GoogleGenerativeAI(validKey) : null;
if (rawKey && !validKey) {
  console.warn('[NEXUS] Clé Gemini invalide (doit commencer par AIzaSy). Mode FAQ local activé.');
}

// Contenu aligné sur la V1 vitrine (plan de mise en ligne V1 §2.1) : NEXUS ne
// doit annoncer aucune capacité chiffrée, aucun tarif, aucun ancien tournoi/
// partenaire, ni pourcentage de reversement Fondation tant que ces éléments
// ne sont pas officiellement validés. En cas de doute, renvoyer vers
// comiteetuinfo@cegepstfe.ca ou la page correspondante plutôt qu'inventer.
const NEXUS_CONTEXT = `Tu es NEXUS, l'assistant IA officiel de l'événement Lan St-Jean au Cégep de Saint-Félicien.
Ton style est direct, précis, avec une touche "gaming/esport" — tu utilises parfois des termes gaming mais tu restes professionnel.
Réponds TOUJOURS en français québécois, de façon concise (maximum 3-4 phrases).
Tu connais parfaitement ces informations sur l'événement:

DATES ET LIEU:
- Dates: 9, 10 et 11 octobre 2026
- Lieu: Cégep de Saint-Félicien, 525 Boul. Hamel, Saint-Félicien, Québec G8K 2R8
- Contact: comiteetuinfo@cegepstfe.ca | Téléphone: 581 704-1221
- Co-organisateurs: Gabriel Hervé et Jovan Knezevic

HORAIRE (source unique: le calendrier détaillé de la page Calendrier — ne pas
donner d'heures qui contredisent celui-ci):
- Vendredi 9 oct 18h00-19h15: accueil et installation des participants
- Vendredi 9 oct 19h30-20h20: cérémonie officielle d'ouverture à la Salle Azimut
- Vendredi 9 oct 20h20-21h50: programmation artistique d'ouverture, artistes à annoncer
- Vendredi 9 oct 22h00-02h00: qualifications LoL, CS2 et Rocket League
- Samedi 10 oct 10h00-12h00: qualifications et jeux libres
- Samedi 10 oct 12h00-13h00: pause repas
- Samedi 10 oct 13h00-15h00: rencontres, entrevues, conférences et contenus Twitch
- Samedi 10 oct 15h00-17h00: deuxième vague de qualifications
- Samedi 10 oct 17h00-18h30: animations et activités visiteurs
- Samedi 10 oct 18h30-20h00: pause repas
- Samedi 10 oct 20h00-22h00: quarts et demi-finales sélectionnés, en direct sur Twitch
- Samedi 10 oct 22h00-00h00: animations nocturnes et jeux libres
- Dimanche 11 oct 09h30-11h30: derniers matchs et qualification des finalistes
- Dimanche 11 oct 11h30-15h30: pause générale et reconfiguration
- Dimanche 11 oct 15h30: réouverture au public pour le Festival des finales
- Dimanche 11 oct 16h00-16h30: show d'ouverture du Festival des finales, artiste à annoncer
- Dimanche 11 oct 16h30-16h45: présentation des finalistes
- Dimanche 11 oct 16h45-20h30: grandes finales LoL, CS2 et Rocket League en direct sur Twitch
- Dimanche 11 oct 20h30-21h00: remise des prix, remerciements et clôture
- La programmation du dimanche soir reste sous réserve de validation finale du Cégep; ne jamais annoncer de capacité publique pour cette soirée tant qu'elle n'est pas confirmée.

PROGRAMMATION ARTISTIQUE:
- Deux créneaux publics existent actuellement: vendredi 20h20-21h50 et dimanche 16h00-16h30.
- Les noms des artistes et l'ordre détaillé des prestations ne doivent pas être annoncés avant validation du comité et des équipes artistiques.
- Le cœur du projet demeure le gaming et les compétitions esport; les shows viennent renforcer l'expérience et les temps forts du week-end.

BILLETTERIE (bientôt disponible — ne jamais annoncer de prix ou de capacité):
- La billetterie n'est pas encore ouverte. Tarifs, catégories et places
  disponibles seront annoncés lors de l'ouverture officielle.
- Ne jamais donner de chiffre de capacité ni de prix, même approximatif.
- Rediriger vers la page /billetterie pour les dernières nouvelles.

TOURNOIS OFFICIELS (les 3 seuls confirmés):
- League of Legends (5v5)
- Counter-Strike 2 (5v5)
- Rocket League (3v3)
- Règlement et récompenses: à venir/à annoncer, rien n'est confirmé.
- D'autres jeux et animations non compétitifs (consoles, arcade, jeux
  indépendants, etc.) sont aussi prévus, voir la page /competitions.

PARTENAIRES:
- Le Cégep de Saint-Félicien et sa Fondation sont les partenaires
  institutionnels centraux de l'événement.
- Ne jamais citer de nom d'entreprise partenaire de mémoire — la liste à jour
  des partenaires publiquement autorisés est sur la page /partenaires
  uniquement. Si on te demande qui sont les partenaires, renvoie vers cette
  page plutôt que d'en nommer.
- Ne jamais mentionner Ubisoft Saguenay comme "partenaire majeur" avec logo:
  leur collaboration reste discrète pour l'instant.

FONDATION / DONS (bientôt disponibles):
- Une partie des profits de l'événement soutient la Fondation du Cégep de
  Saint-Félicien, qui aide des étudiants chaque année.
- Ne jamais donner de pourcentage de reversement précis ni de montant de
  bourses tant que ce n'est pas confirmé par la Fondation et le Cégep.
- Les dons en ligne et le Ticket d'Or ne sont pas encore ouverts au public.

INFORMATIONS SUPPLÉMENTAIRES:
- Lan St-Jean relance l'esprit de la toute première LAN Gaming CSF (avril 2023) avec une nouvelle équipe étudiante — un événement en pleine croissance au Saguenay–Lac-Saint-Jean
- Espaces: Place centrale (grind principal, postes de jeu des participants), Salle Azimut (compétitions, cérémonies et shows), 2e étage (espace visiteur), Gymnase (salle de repos)

Si tu ne sais pas quelque chose sur l'événement, ou si l'information n'est pas encore confirmée publiquement, dis-le honnêtement et redirige vers comiteetuinfo@cegepstfe.ca plutôt que d'inventer un chiffre, un nom ou une date.
Ne réponds PAS aux questions hors-sujet (politique, médecine, etc.) — recentre sur l'événement.`;

// ── NEXUS Smart Local FAQ (fallback sans API Gemini) ─────────────────────────
const NEXUS_FAQ = [
  {
    keywords: ['quand', 'date', 'dates', 'octobre', 'quand est', 'pendant', 'horaire'],
    response: "Lan St-Jean se déroule du 9 au 11 octobre 2026! Ça débute vendredi le 9 avec l'accueil à 18h et la cérémonie officielle d'ouverture à 19h30 à la Salle Azimut.",
  },
  {
    keywords: ['billet', 'billets', 'ticket', 'prix', 'coût', 'combien', 'tarif', 'payer', 'achat', 'capacité', 'places'],
    response: "La billetterie n'est pas encore ouverte — les tarifs et les places disponibles seront annoncés bientôt sur la page Billetterie. Reste à l'affût!",
  },
  {
    keywords: ['tournoi', 'tournois', 'jeu', 'jeux', 'lol', 'league', 'cs2', 'counter', 'rocket', 'compétition'],
    response: "Tournois officiels: League of Legends, Counter-Strike 2 et Rocket League. Des jeux et animations non compétitifs sont aussi prévus — détails sur la page Compétitions.",
  },
  {
    keywords: ['où', 'ou', 'lieu', 'adresse', 'cégep', 'cegep', 'saint-félicien', 'felicien', 'saguenay', 'lac'],
    response: "Lan St-Jean a lieu au Cégep de Saint-Félicien, 525 Boul. Hamel, Saint-Félicien, QC G8K 2R8 — au cœur du Saguenay–Lac-Saint-Jean!",
  },
  {
    keywords: ['partenaire', 'partenaires', 'sponsor', 'commanditaire'],
    response: "La liste à jour de nos partenaires officiels est sur la page Partenaires. Intéressé à le devenir? Écris à comiteetuinfo@cegepstfe.ca!",
  },
  {
    keywords: ['fondation', 'bourse', 'bourses', 'charité', 'don', 'dons', 'twitch', 'stream'],
    response: "Une partie des profits de l'événement soutient la Fondation du Cégep de Saint-Félicien. Les dons en ligne et le Ticket d'Or ouvriront bientôt — suis la page Cagnotte!",
  },
  {
    keywords: ['contact', 'courriel', 'email', 'téléphone', 'telephone', 'joindre', 'organisateur', 'équipe'],
    response: "Contacte-nous: comiteetuinfo@cegepstfe.ca ou 581 704-1221. Organisé par Gabriel Hervé et Jovan Knezevic, Comité Étudiant Informatique du Cégep de Saint-Félicien.",
  },
  {
    keywords: ['programme', 'schedule', 'vendredi', 'samedi', 'dimanche', 'calendrier', 'agenda'],
    response: "Ven 9: ouverture officielle 19h30, programmation artistique dès 20h20, qualifications à 22h. Sam 10: tournois, animations et quarts/demi-finales. Dim 11: Festival des finales prévu dès 15h30, grandes finales à partir de 16h45, sous réserve de validation finale du Cégep. Programme complet sur la page Calendrier!",
  },
  {
    keywords: ['artiste', 'artistes', 'concert', 'show', 'spectacle'],
    response: "Des créneaux artistiques sont prévus vendredi soir et dimanche au Festival des finales. Les noms et l'ordre détaillé seront annoncés seulement après validation officielle; le gaming et les compétitions restent au cœur du week-end.",
  },
  {
    keywords: ['équipement', 'equipement', 'pc', 'ordinateur', 'écran', 'setup', 'matériel', 'apporter'],
    response: "Les modalités précises (équipement à apporter, limites) seront confirmées avec l'ouverture de la billetterie. Pour l'instant, prévois ton PC gaming et de la bonne humeur!",
  },
  {
    keywords: ['inscription', 'inscrire', 'comment', 'participer', 'enregistrement', 'register'],
    response: "Les inscriptions aux tournois ouvriront avec la billetterie, qui n'est pas encore disponible. Reste à l'affût sur la page Billetterie et nos réseaux!",
  },
  {
    keywords: ['remboursement', 'annulation', 'cancel', 'rembours'],
    response: "La politique de remboursement sera précisée à l'ouverture de la billetterie. Pour toute question, contacte comiteetuinfo@cegepstfe.ca.",
  },
];

function nexusLocalReply(message) {
  const lower = message.toLowerCase();
  for (const faq of NEXUS_FAQ) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.response;
    }
  }
  return null;
}

const router = Router();

// ── Ticket Inventory (persisted to disk) ──────────────────────────────────────
const TICKET_DEADLINE = new Date('2026-10-02T23:59:59-04:00');

const ticketInventory = loadJSON('tickets.json', {
  visiteur:    { capacity: 60, sold: 0 },
  joueur:      { capacity: 60, sold: 0 },
  competiteur: { capacity: 30, sold: 0 },
});

// Tarifs — jamais codés en dur côté frontend (cahier §11 : non validés par
// le Cégep). Renseignés par variables d'environnement à la validation, sans
// redéploiement (cPanel > Setup Node.js App > variables). Tant qu'ils sont
// absents, le front affiche « À venir » et bloque l'achat.
function envPrice(name) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
const TICKET_PRICES = {
  visiteur:    envPrice('TICKET_PRICE_VISITEUR'),
  joueur:      envPrice('TICKET_PRICE_JOUEUR'),
  competiteur: envPrice('TICKET_PRICE_COMPETITEUR'),
};

function computeTicketData() {
  const now = new Date();
  const deadlinePassed = now >= TICKET_DEADLINE;
  const inv = ticketInventory;
  const remaining = {
    visiteur:    inv.visiteur.capacity - inv.visiteur.sold,
    joueur:      inv.joueur.capacity - inv.joueur.sold,
    competiteur: inv.competiteur.capacity - inv.competiteur.sold,
  };
  const allSoldOut = Object.values(remaining).every(r => r <= 0);
  const salesClosed = deadlinePassed || allSoldOut;

  return {
    deadline: TICKET_DEADLINE.toISOString(),
    deadlinePassed,
    allSoldOut,
    salesClosed,
    inventory: {
      visiteur:    { ...inv.visiteur,    remaining: remaining.visiteur },
      joueur:      { ...inv.joueur,      remaining: remaining.joueur },
      competiteur: { ...inv.competiteur, remaining: remaining.competiteur },
    },
  };
}

// ── GET /api/tickets/status (public) ─────────────────────────────────────────
// Tant que ticket_sales_enabled/show_capacity sont désactivés (cahier §3), on
// ne publie ni capacité, ni places restantes, ni date de fermeture des ventes —
// uniquement les deux flags, pour que le front sache afficher le mode "Coming
// Soon". Le détail complet reste disponible côté admin via /admin/tickets/status.
router.get('/tickets/status', (_req, res) => {
  const { ticketSalesEnabled, showCapacity } = getSiteSettings();
  const data = { ticketSalesEnabled, showCapacity };
  if (showCapacity) Object.assign(data, computeTicketData());
  if (ticketSalesEnabled) data.prices = TICKET_PRICES;
  res.json({ success: true, data });
});

// ── GET /api/admin/tickets/status (admin) ─────────────────────────────────────
// Vue complète pour la gestion d'inventaire, indépendante des flags publics.
router.get('/admin/tickets/status', requireAdmin, (_req, res) => {
  res.json({ success: true, data: { ...getSiteSettings(), ...computeTicketData(), prices: TICKET_PRICES } });
});

// ── POST /api/admin/tickets/adjust (admin) ────────────────────────────────────
router.post('/admin/tickets/adjust', requireAdmin, (req, res) => {
  const { type, sold } = req.body || {};
  const validTypes = ['visiteur', 'joueur', 'competiteur'];
  if (!type || !validTypes.includes(type) || typeof sold !== 'number' || sold < 0) {
    return res.status(400).json({ error: 'Paramètres invalides.' });
  }
  ticketInventory[type].sold = Math.min(ticketInventory[type].capacity, Math.max(0, sold));
  saveJSON('tickets.json', ticketInventory);
  res.json({ success: true, inventory: ticketInventory });
});

// ── GET /api/site-settings (public) ───────────────────────────────────────────
router.get('/site-settings', (_req, res) => {
  res.json({ success: true, data: getSiteSettings() });
});

// ── POST /api/admin/site-settings (admin) ─────────────────────────────────────
router.post('/admin/site-settings', requireAdmin, (req, res) => {
  const { ticketSalesEnabled, showCapacity } = req.body || {};
  if (ticketSalesEnabled !== undefined && typeof ticketSalesEnabled !== 'boolean') {
    return res.status(400).json({ error: 'ticketSalesEnabled doit être un booléen.' });
  }
  if (showCapacity !== undefined && typeof showCapacity !== 'boolean') {
    return res.status(400).json({ error: 'showCapacity doit être un booléen.' });
  }
  res.json({ success: true, data: updateSiteSettings({ ticketSalesEnabled, showCapacity }) });
});

// ── Tournament State ──────────────────────────────────────────────────────────
// Les 3 seuls tournois officiellement confirmés (plan de mise en ligne V1 §2.1)
const GAMES = ['lol', 'cs2', 'rocket_league'];

const GAME_INFO = {
  lol:          { name: 'League of Legends', short: 'LoL',      icon: '⚔️',  color: '#C89B3C', teamSize: 5 },
  cs2:          { name: 'Counter-Strike 2',  short: 'CS2',      icon: '🔫',  color: '#FF4655', teamSize: 5 },
  rocket_league:{ name: 'Rocket League',     short: 'Rocket',   icon: '🚀',  color: '#4FC3F7', teamSize: 3 },
};

// Load persisted tournament data (teams, rounds, status) — GAME_INFO is always static
const persistedTournaments = loadJSON('tournaments.json', {});

const tournamentState = {};
GAMES.forEach(game => {
  const saved = persistedTournaments[game] || {};
  tournamentState[game] = {
    game,
    info: GAME_INFO[game],
    teams:     saved.teams     ?? [],
    rounds:    saved.rounds    ?? [],
    status:    saved.status    ?? 'registration',
    generated: saved.generated ?? false,
  };
});

function saveTournaments() {
  const toSave = {};
  GAMES.forEach(g => {
    toSave[g] = {
      teams:     tournamentState[g].teams,
      rounds:    tournamentState[g].rounds,
      status:    tournamentState[g].status,
      generated: tournamentState[g].generated,
    };
  });
  saveJSON('tournaments.json', toSave);
}

function generateBracket(teams) {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const size = Math.pow(2, Math.ceil(Math.log2(Math.max(shuffled.length, 2))));
  while (shuffled.length < size) shuffled.push(null);

  const rounds = [];
  let roundTeams = shuffled;
  let roundNum = 1;

  while (roundTeams.length > 1) {
    const matches = [];
    for (let i = 0; i < roundTeams.length; i += 2) {
      const team1 = roundTeams[i];
      const team2 = roundTeams[i + 1];
      matches.push({
        id: `r${roundNum}m${i / 2 + 1}`,
        roundNumber: roundNum,
        matchNumber: i / 2 + 1,
        team1,
        team2,
        score1: null,
        score2: null,
        winner: null,
        status: (!team1 || !team2) ? 'bye' : 'pending',
      });
    }
    // Auto-advance byes
    matches.forEach(m => {
      if (m.status === 'bye') {
        m.winner = m.team1 || m.team2;
        m.status = 'completed';
      }
    });
    rounds.push({ roundNumber: roundNum, matches });
    roundTeams = new Array(roundTeams.length / 2).fill(null);
    roundNum++;
  }
  return rounds;
}

// ── GET /api/tournaments (admin) ───────────────────────────────────────────────
// La vitrine publique (/competitions) est statique, sans bracket public (plan
// de mise en ligne V1) — cette liste (et le détail ci-dessous, qui inclut les
// noms d'équipes et courriels des capitaines) reste réservée à l'admin.
router.get('/tournaments', requireAdmin, (_req, res) => {
  const data = GAMES.map(game => ({
    game,
    ...GAME_INFO[game],
    teamsCount: tournamentState[game].teams.length,
    status: tournamentState[game].status,
    generated: tournamentState[game].generated,
  }));
  res.json({ success: true, data });
});

// ── GET /api/tournaments/:game (admin) ────────────────────────────────────────
router.get('/tournaments/:game', requireAdmin, (req, res) => {
  const { game } = req.params;
  if (!GAMES.includes(game)) return res.status(404).json({ error: 'Tournoi introuvable.' });
  res.json({ success: true, data: tournamentState[game] });
});

// ── POST /api/tournaments/register-team (authenticated) ──────────────────────
router.post('/tournaments/register-team', requireAuth, (req, res) => {
  const { game, teamName } = req.body || {};
  if (!game || !GAMES.includes(game) || !teamName || !teamName.trim()) {
    return res.status(400).json({ error: 'Jeu et nom d\'équipe requis.' });
  }
  if (tournamentState[game].generated) {
    return res.status(400).json({ error: 'Le bracket est déjà généré. Inscription fermée.' });
  }
  const user = req.user;
  const tournament = tournamentState[game];

  tournament.teams = tournament.teams.filter(t => !t.captainEmail.includes(user.email));

  const team = {
    id: `${game}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: sanitizeString(String(teamName).trim().slice(0, 50)),
    game,
    captainEmail: user.email,
    captainName: user.name,
    registeredAt: new Date().toISOString(),
  };

  tournament.teams.push(team);
  saveTournaments();
  res.json({ success: true, team });
});

// ── POST /api/tournaments/:game/generate (admin) ──────────────────────────────
router.post('/tournaments/:game/generate', requireAdmin, (req, res) => {
  const { game } = req.params;
  if (!GAMES.includes(game)) return res.status(404).json({ error: 'Tournoi introuvable.' });
  const tournament = tournamentState[game];
  if (tournament.teams.length < 2) {
    return res.status(400).json({ error: 'Minimum 2 équipes requises pour générer un bracket.' });
  }
  tournament.rounds = generateBracket(tournament.teams);
  tournament.status = 'bracket';
  tournament.generated = true;
  saveTournaments();
  req.app.get('io')?.emit('bracket-update', { game, data: tournament });
  res.json({ success: true, data: tournament });
});

// ── PUT /api/tournaments/match/:matchId (admin) ───────────────────────────────
router.put('/tournaments/match/:matchId', requireAdmin, (req, res) => {
  const { matchId } = req.params;
  const { game, score1, score2 } = req.body || {};
  if (!game || !GAMES.includes(game)) return res.status(400).json({ error: 'Jeu requis.' });

  const tournament = tournamentState[game];
  let foundMatch = null;
  let foundRoundIndex = -1;
  let foundMatchIndex = -1;

  for (let ri = 0; ri < tournament.rounds.length; ri++) {
    const mi = tournament.rounds[ri].matches.findIndex(m => m.id === matchId);
    if (mi !== -1) { foundMatch = tournament.rounds[ri].matches[mi]; foundRoundIndex = ri; foundMatchIndex = mi; break; }
  }
  if (!foundMatch) return res.status(404).json({ error: 'Match introuvable.' });

  foundMatch.score1 = typeof score1 === 'number' ? score1 : foundMatch.score1;
  foundMatch.score2 = typeof score2 === 'number' ? score2 : foundMatch.score2;

  if (typeof foundMatch.score1 === 'number' && typeof foundMatch.score2 === 'number' && foundMatch.score1 !== foundMatch.score2) {
    foundMatch.winner = foundMatch.score1 > foundMatch.score2 ? foundMatch.team1 : foundMatch.team2;
    foundMatch.status = 'completed';

    if (foundRoundIndex + 1 < tournament.rounds.length) {
      const nextRound = tournament.rounds[foundRoundIndex + 1];
      const nextMatchIdx = Math.floor(foundMatchIndex / 2);
      if (nextMatchIdx < nextRound.matches.length) {
        const nxt = nextRound.matches[nextMatchIdx];
        if (foundMatchIndex % 2 === 0) nxt.team1 = foundMatch.winner;
        else nxt.team2 = foundMatch.winner;
        if (nxt.team1 && nxt.team2) nxt.status = 'pending';
      }
    }
  }

  const allDone = tournament.rounds.every(r =>
    r.matches.every(m => m.status === 'completed' || m.status === 'bye'),
  );
  if (allDone) tournament.status = 'completed';

  saveTournaments();
  req.app.get('io')?.emit('bracket-update', { game, data: tournament });
  res.json({ success: true, data: tournament });
});

// ── DELETE /api/tournaments/:game/reset (admin) ───────────────────────────────
router.delete('/tournaments/:game/reset', requireAdmin, (req, res) => {
  const { game } = req.params;
  if (!GAMES.includes(game)) return res.status(404).json({ error: 'Tournoi introuvable.' });
  tournamentState[game].rounds = [];
  tournamentState[game].status = 'registration';
  tournamentState[game].generated = false;
  saveTournaments();
  req.app.get('io')?.emit('bracket-update', { game, data: tournamentState[game] });
  res.json({ success: true });
});

// ── GET /api/admin/competitors (admin) ───────────────────────────────────────
router.get('/admin/competitors', requireAdmin, (_req, res) => {
  const competitors = GAMES.flatMap(game =>
    tournamentState[game].teams.map(t => ({ ...t, gameName: GAME_INFO[game].name })),
  );
  res.json({ success: true, data: competitors });
});

// ── GET /api/admin/festival-finales-proposal (admin) ─────────────────────────
// Document de travail interne (format du dimanche). Servi uniquement à une
// session admin authentifiée — avant, ce contenu vivait en dur dans le bundle
// JS de la page React /interne/festival-finales, donc téléchargé par N'IMPORTE
// QUEL visiteur même si l'affichage était bloqué côté client (le garde
// isAdmin ne protège que le rendu, pas le code déjà présent dans le bundle).
router.get('/admin/festival-finales-proposal', requireAdmin, (_req, res) => {
  res.json({
    success: true,
    data: {
      intro: 'Interrompre la phase LAN du dimanche en fin de matinée, offrir une vraie période de repos, puis rouvrir en fin d\'après-midi pour une soirée de grandes finales pensée comme un véritable « main event ». Objectif : concilier le besoin de repos du Cégep avec une clôture à la hauteur de l\'importance sportive et médiatique des finales.',
      sequence: [
        { time: 'Matin — jusqu\'à 11h / 11h30', phase: 'Fin de la phase LAN', detail: 'Dernières activités, fermeture progressive, clarification des finalistes.' },
        { time: '11h / 11h30 à 16h', phase: 'Pause technique et humaine', detail: 'Repos, repas, douche, déplacement à l\'hôtel; rangement, nettoyage, reconfiguration, balances et tests.' },
        { time: '16h – 21h', phase: 'Festival des Finales', detail: 'Réouverture au public, animations, interviews, shows, finales, remise des prix et clôture.' },
      ],
      contentItems: [
        'Réouverture de la place centrale dans une configuration orientée spectacle',
        'Billetterie visiteurs / accès grand public à étudier selon capacité et sécurité',
        'Bars et restauration, selon les politiques et partenaires autorisés par le Cégep',
        'Présentation des équipes finalistes et séquences d\'interviews',
        'Finales de Rocket League, Counter-Strike 2 et League of Legends',
        'Interventions artistiques courtes entre certaines séquences, selon ententes',
        'Remise des trophées, photos officielles, mot de la Fondation et clôture',
        'Production Twitch renforcée — compte à rebours, transitions, interviews, "main event"',
      ],
      benefits: [
        {
          icon: 'Users', color: '#C89B3C', title: 'Participants & finalistes',
          items: [
            'Une vraie coupure pour manger, dormir, se laver, se changer',
            'Finales disputées dans de meilleures conditions',
            'Les finalistes ne terminent pas dans un espace qui se vide',
            'Cérémonie de remise des prix plus marquante',
          ],
        },
        {
          icon: 'ShieldAlert', color: '#4FC3F7', title: 'Organisateurs & Cégep',
          items: [
            'Fenêtre pour nettoyer, ranger, reconfigurer, tester',
            'Séparation claire entre phase "LAN" et phase "spectacle"',
            'Meilleure maîtrise de l\'expérience partenaires/public',
            'Contenu institutionnel plus fort après l\'événement',
          ],
        },
        {
          icon: 'Heart', color: '#FF4655', title: 'Fondation',
          items: [
            'Rassemblement avec un public plus large',
            'Meilleure visibilité de la mission caritative',
            'Potentiel accru pour les dons Twitch et sur place',
            'Moment central pour impliquer médias et partenaires',
          ],
        },
        {
          icon: 'Handshake', color: '#7C3AED', title: 'Partenaires & Saint-Félicien',
          items: [
            'Public concentré pour les séquences les plus visibles',
            'Meilleure qualité photos/vidéos/activation de marque',
            'Peut attirer des visiteurs spécifiquement pour les finales',
            'Image forte pour promouvoir une édition suivante',
          ],
        },
      ],
      constraints: [
        { concern: 'Fatigue des organisateurs et participants', response: 'Pause de 4 à 5 heures; fin des matchs officiels plus tôt le samedi; hébergement partenaire; équipes en rotation.' },
        { concern: 'Participants qui doivent repartir / travailler / étudier', response: 'La soirée finale ne doit pas empêcher un non-finaliste de quitter plus tôt; horaires communiqués avant la billetterie.' },
        { concern: 'Coût des agents de sécurité', response: 'Chiffrage précis du surcoût; évaluer si revenus visiteurs/commandites peuvent compenser.' },
        { concern: 'Entretien et remise en état des lieux', response: 'Utiliser la pause de mi-journée pour un nettoyage complet; équipe dédiée à la fermeture de 21h.' },
        { concern: 'Risque de dépassement d\'horaire', response: 'Conducteur minute par minute, marges de transition, format de finales compatible avec la fenêtre.' },
        { concern: 'Complexité technique', response: 'Tester scène, réseau, électricité et régie avant l\'ouverture; simplifier les changements de configuration.' },
        { concern: 'Capacité du public', response: 'Billetterie visiteurs limitée à la capacité validée; contrôle des accès et zones définies.' },
        { concern: 'Droits musicaux et diffusion', response: 'Inclure captation/Twitch dans les ententes artistes; finaliser les licences avant l\'événement.' },
      ],
      recommendedPosition: 'Présenter la soirée finale comme une option conditionnelle : elle ne doit être retenue que si le budget sécurité, les ressources humaines, la capacité, le nettoyage et les contraintes techniques peuvent être couverts de manière réaliste.',
      decisions: [
        'Le Cégep accepte-t-il d\'étudier formellement le principe d\'une pause le dimanche suivie d\'une soirée de finales jusqu\'à environ 21h ?',
        'Quelles sont les limites non négociables liées à la sécurité, au personnel, au ménage et à l\'accès aux bâtiments ?',
        'Quelle capacité maximale peut être retenue pour la place centrale et l\'espace visiteurs ?',
        'Une billetterie visiteurs spécifique aux finales peut-elle être étudiée ?',
        'Quelles conditions doivent être remplies pour autoriser une scène/animation artistique dans la place centrale ?',
        'Quel budget et quelles ressources institutionnelles peuvent réellement être engagés ?',
        'Quelle gouvernance doit être retenue pour la sécurité, la technique, Twitch et la programmation ?',
        'Quel calendrier de validation doit être respecté pour lancer la billetterie et les teasers sans risque ?',
      ],
      nextStep: 'Si le concept est jugé intéressant en réunion, l\'étape suivante n\'est pas de l\'annoncer publiquement, mais de produire un mini-plan de faisabilité : sécurité, personnel, capacité, budget, scénario de repli et horaire détaillé — avant toute mise à jour du calendrier public ou de la billetterie.',
    },
  });
});

// ── GET /api/events ──────────────────────────────────────────────────────────
router.get('/events', (_req, res) => {
  const events = [
    { id: 1,  date: '2026-10-09', startTime: '18:00', endTime: '19:15', title: 'Accueil et installation des participants', description: 'Accueil des participants, vérification des accès et installation aux postes de jeu.', location: 'Place centrale — Grind principal', category: 'setup', color: '#636E72' },
    { id: 2,  date: '2026-10-09', startTime: '19:15', endTime: '19:30', title: 'Accueil des invités et partenaires', description: 'Déplacement vers la Salle Azimut et accueil des invités, partenaires et personnes présentes pour l\'ouverture.', location: 'Salle Azimut — Compétitions', category: 'setup', color: '#636E72' },
    { id: 3,  date: '2026-10-09', startTime: '19:30', endTime: '20:20', title: 'Cérémonie officielle d\'ouverture', description: 'Présentation du projet, du Cégep, de la Fondation et des partenaires, suivie des prises de parole officielles.', location: 'Salle Azimut — Compétitions', category: 'ceremony', color: '#FFD700' },
    { id: 4,  date: '2026-10-09', startTime: '20:20', endTime: '21:50', title: 'Programmation artistique d\'ouverture', description: 'Shows et prestations d\'ouverture. Les artistes et l\'ordre détaillé seront annoncés après validation officielle.', location: 'Salle Azimut — Compétitions', category: 'show', color: '#4FC3F7', streamed: true },
    { id: 5,  date: '2026-10-09', startTime: '21:50', endTime: '22:00', title: 'Transition vers les compétitions', description: 'Dernière transition technique et retour vers les zones de jeu avant le lancement officiel des tournois.', location: 'Place centrale — Grind principal', category: 'setup', color: '#636E72' },
    { id: 6,  date: '2026-10-09', startTime: '22:00', endTime: '02:00', title: 'Qualifications — League of Legends · CS2 · Rocket League', description: 'Lancement des qualifications des trois compétitions officielles. Certains matchs et temps forts seront intégrés au live Twitch.', location: 'Place centrale — Grind principal', category: 'tournament', color: '#C89B3C', streamed: true },

    { id: 7,  date: '2026-10-10', startTime: '10:00', endTime: '12:00', title: 'Qualifications et jeux libres', description: 'Poursuite des qualifications League of Legends, Counter-Strike 2 et Rocket League. Jeux libres en parallèle.', location: 'Place centrale — Grind principal', category: 'tournament', color: '#C89B3C' },
    { id: 8,  date: '2026-10-10', startTime: '12:00', endTime: '13:00', title: 'Pause repas', description: 'Pause repas pour les participants. Certaines zones d\'animation peuvent rester accessibles selon la programmation.', location: 'Gymnase — Salle de repos', category: 'break', color: '#27AE60' },
    { id: 9,  date: '2026-10-10', startTime: '13:00', endTime: '15:00', title: 'Rencontres, entrevues, conférences et contenus Twitch', description: 'Séquences consacrées aux invités, partenaires, projets étudiants, entrevues et contenus produits pour le live.', location: '2e étage — Espace visiteur', category: 'activity', color: '#FF6B35', streamed: true },
    { id: 10, date: '2026-10-10', startTime: '15:00', endTime: '17:00', title: 'Deuxième vague de qualifications', description: 'Poursuite des matchs officiels et progression des brackets vers les phases finales.', location: 'Place centrale — Grind principal', category: 'tournament', color: '#C89B3C' },
    { id: 11, date: '2026-10-10', startTime: '17:00', endTime: '18:30', title: 'Animations et activités visiteurs', description: 'Jeux, animations et activités publiques organisées en parallèle du volet compétitif.', location: '2e étage — Espace visiteur', category: 'activity', color: '#FF6B35' },
    { id: 12, date: '2026-10-10', startTime: '18:30', endTime: '20:00', title: 'Pause repas', description: 'Pause repas et période de transition avant les matchs du soir.', location: 'Gymnase — Salle de repos', category: 'break', color: '#27AE60' },
    { id: 13, date: '2026-10-10', startTime: '20:00', endTime: '22:00', title: 'Quarts et demi-finales — matchs sélectionnés', description: 'Sélection de matchs importants des phases finales, avec commentaires et diffusion en direct sur Twitch.', location: 'Salle Azimut — Compétitions', category: 'final', color: '#FFD700', streamed: true },
    { id: 14, date: '2026-10-10', startTime: '22:00', endTime: '00:00', title: 'Animations nocturnes et jeux libres', description: 'Animations de soirée, jeux libres et moments communautaires après les matchs officiels de la journée.', location: 'Place centrale — Grind principal', category: 'activity', color: '#9B59B6' },

    { id: 15, date: '2026-10-11', startTime: '09:30', endTime: '11:30', title: 'Derniers matchs et qualification des finalistes', description: 'Derniers matchs nécessaires pour déterminer les équipes qui accéderont aux grandes finales.', location: 'Place centrale — Grind principal', category: 'tournament', color: '#C89B3C' },
    { id: 16, date: '2026-10-11', startTime: '11:30', endTime: '15:30', title: 'Pause générale et reconfiguration', description: 'Pause pour les participants et transformation des espaces en vue du Festival des finales. Programmation du dimanche soir sous réserve de validation finale du Cégep.', location: 'Gymnase — Salle de repos', category: 'setup', color: '#636E72' },
    { id: 17, date: '2026-10-11', startTime: '15:30', endTime: '16:00', title: 'Réouverture au public — Festival des finales', description: 'Accueil du public, mise en ambiance et lancement de la grande séquence finale du week-end.', location: 'Salle Azimut — Compétitions', category: 'ceremony', color: '#FFD700' },
    { id: 18, date: '2026-10-11', startTime: '16:00', endTime: '16:30', title: 'Show d\'ouverture du Festival des finales', description: 'Prestation artistique d\'ouverture. Le nom de l\'artiste sera annoncé après validation officielle.', location: 'Salle Azimut — Compétitions', category: 'show', color: '#4FC3F7', streamed: true },
    { id: 19, date: '2026-10-11', startTime: '16:30', endTime: '16:45', title: 'Présentation des finalistes', description: 'Présentation des équipes, mise en scène des finalistes et lancement de la séquence compétitive.', location: 'Salle Azimut — Compétitions', category: 'ceremony', color: '#FFD700', streamed: true },
    { id: 20, date: '2026-10-11', startTime: '16:45', endTime: '20:30', title: 'Grandes finales — LoL · CS2 · Rocket League', description: 'Grandes finales des trois compétitions officielles, avec commentaires et diffusion en direct sur Twitch. L\'ordre précis des jeux sera publié après verrouillage des formats de tournoi.', location: 'Salle Azimut — Compétitions', category: 'final', color: '#FFD700', streamed: true },
    { id: 21, date: '2026-10-11', startTime: '20:30', endTime: '21:00', title: 'Remise des prix et clôture', description: 'Remise des prix, remerciements aux participants, bénévoles, partenaires et à la Fondation, puis clôture officielle du week-end.', location: 'Salle Azimut — Compétitions', category: 'ceremony', color: '#FFD700', streamed: true },
  ];
  res.status(200).json({ success: true, data: events });
});

// ── GET /api/partners ────────────────────────────────────────────────────────
// Centre Hi-Fi et e-distribution retirés (rien de confirmé par écrit).
// Paliers confirmés par le comité (6 sept. 2026) : UQAC Diamant, Mazda Or,
// MRC du Domaine-du-Roy Or, Metro Bronze. L'ordre du tableau = ordre
// d'affichage des sections sur l'accueil (Sponsor.jsx groupe par tier dans
// l'ordre reçu).
router.get('/partners', (_req, res) => {
  const partners = [
    { id: 1, name: 'Cégep de Saint-Félicien', logo: '/logos/cegep.jpg', url: 'https://www.cstfelicien.qc.ca', tier: 'principal' },
    { id: 2, name: 'Fondation du Cégep', logo: '/logos/fondation.svg', url: '#fondation', tier: 'charitable' },
    { id: 5, name: 'UQAC', logo: '/logos/uqac.svg', url: 'https://www.uqac.ca', tier: 'diamant' },
    { id: 4, name: 'Mazda', logo: '/logos/mazda.svg', url: 'https://www.mazda.ca', tier: 'or' },
    { id: 6, name: 'MRC du Domaine-du-Roy', logo: '/logos/mrc-domaine-du-roy.svg', url: 'https://www.mrcdomaineduroy.ca', tier: 'or' },
    { id: 3, name: 'Metro', logo: '/logos/metro.svg', url: 'https://www.metro.ca', tier: 'bronze' },
  ];
  res.status(200).json({ success: true, data: partners });
});

// ── POST /api/boutique/commande ──────────────────────────────────────────────
router.post('/boutique/commande', async (req, res) => {
  const { name, email, items, total } = req.body || {};
  if (!name || !email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Données de commande incomplètes.' });
  }
  const cleanName  = sanitizeString(String(name).slice(0, 100));
  const cleanEmail = sanitizeString(String(email).slice(0, 150));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Courriel invalide.' });
  }

  const itemsText = items.map(i => `• ${i.name} (${i.size}) ×${i.qty} = ${i.subtotal}$`).join('\n');
  const itemsHtml = items.map(i =>
    `<tr><td style="padding:4px 12px 4px 0">${i.name}</td><td>${i.size}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right;font-weight:bold;color:#C89B3C">${i.subtotal}$</td></tr>`
  ).join('');

  console.log('[BOUTIQUE]', cleanEmail, '-', items.length, 'articles -', total + '$');

  if (mailer) {
    try {
      // Notification à l'organisateur
      await mailer.sendMail({
        from: `"Lan St-Jean - Boutique" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO || 'comiteetuinfo@cegepstfe.ca',
        replyTo: cleanEmail,
        subject: `[Lan St-Jean] Nouvelle commande boutique — ${cleanName} (${total}$)`,
        html: `<h2 style="color:#C89B3C;font-family:sans-serif">Nouvelle commande boutique</h2>
<p style="font-family:sans-serif"><strong>Client :</strong> ${cleanName} &lt;${cleanEmail}&gt;</p>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:500px">
  <thead><tr style="border-bottom:2px solid #C89B3C">
    <th style="text-align:left;padding:6px 12px 6px 0">Article</th>
    <th style="text-align:left;padding:6px 12px 6px 0">Taille</th>
    <th style="text-align:center;padding:6px 8px">Qté</th>
    <th style="text-align:right;padding:6px 0">Sous-total</th>
  </tr></thead>
  <tbody>${itemsHtml}</tbody>
  <tfoot><tr style="border-top:2px solid #C89B3C">
    <td colspan="3" style="padding:8px 0;font-weight:bold;font-family:sans-serif">TOTAL</td>
    <td style="text-align:right;font-weight:bold;color:#C89B3C;font-size:18px">${total}$</td>
  </tr></tfoot>
</table>
<p style="font-family:sans-serif;color:#888;font-size:12px;margin-top:16px">Remise sur place à l'événement · Paiement lors de la récupération</p>`,
      });
      // Confirmation au client
      await mailer.sendMail({
        from: `"Lan St-Jean" <${process.env.SMTP_USER}>`,
        to: cleanEmail,
        subject: `[Lan St-Jean] Confirmation de ta commande — ${total}$`,
        html: `<h2 style="color:#C89B3C;font-family:sans-serif">Ta commande est confirmée !</h2>
<p style="font-family:sans-serif">Bonjour ${cleanName},</p>
<p style="font-family:sans-serif">Merci pour ta commande ! Voici le récapitulatif :</p>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:500px">
  <thead><tr style="border-bottom:2px solid #C89B3C">
    <th style="text-align:left;padding:6px 12px 6px 0">Article</th>
    <th style="text-align:left;padding:6px 12px 6px 0">Taille</th>
    <th style="text-align:center;padding:6px 8px">Qté</th>
    <th style="text-align:right;padding:6px 0">Sous-total</th>
  </tr></thead>
  <tbody>${itemsHtml}</tbody>
  <tfoot><tr style="border-top:2px solid #C89B3C">
    <td colspan="3" style="padding:8px 0;font-weight:bold;font-family:sans-serif">TOTAL</td>
    <td style="text-align:right;font-weight:bold;color:#C89B3C;font-size:18px">${total}$</td>
  </tr></tfoot>
</table>
<p style="font-family:sans-serif;margin-top:16px">Tu pourras récupérer tes articles et payer sur place lors de l'événement :</p>
<p style="font-family:sans-serif"><strong>Lan St-Jean — 9, 10 et 11 octobre 2026</strong><br>Cégep de Saint-Félicien, 525 Boul. Hamel, Saint-Félicien, QC</p>
<p style="font-family:sans-serif;color:#888;font-size:12px">Des questions ? comiteetuinfo@cegepstfe.ca · 581 704-1221</p>`,
      });
    } catch (err) {
      console.error('[BOUTIQUE_EMAIL_ERROR]', err.message);
    }
  }

  res.status(200).json({ success: true, message: 'Commande reçue. Un courriel de confirmation t\'a été envoyé.' });
});

// ── POST /api/contact ────────────────────────────────────────────────────────
router.post('/contact', validateContact, async (req, res) => {
  const clean = sanitizeObject(req.body);
  console.log('[CONTACT]', clean.email, '-', clean.subject, '-', new Date().toISOString());

  if (mailer) {
    try {
      await mailer.sendMail({
        from: `"Lan St-Jean - Contact" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO || 'comiteetuinfo@cegepstfe.ca',
        replyTo: clean.email,
        subject: `[Lan St-Jean] ${clean.subject} — ${clean.name}`,
        text: `Nom: ${clean.name}\nCourriel: ${clean.email}\nSujet: ${clean.subject}\n\n${clean.message}`,
        html: `<h2 style="color:#C89B3C">Nouveau message — Lan St-Jean</h2>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
  <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold">Nom</td><td>${clean.name}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold">Courriel</td><td><a href="mailto:${clean.email}">${clean.email}</a></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold">Sujet</td><td>${clean.subject}</td></tr>
</table>
<hr style="border-color:#eee;margin:16px 0">
<p style="white-space:pre-wrap;font-family:sans-serif;font-size:14px">${clean.message}</p>`,
      });
      console.log('[CONTACT] Email envoyé à comiteetuinfo@cegepstfe.ca');
    } catch (err) {
      console.error('[CONTACT_EMAIL_ERROR]', err.message);
    }
  }

  res.status(200).json({ success: true, message: 'Message reçu. Nous vous répondrons sous 48h.' });
});

// ── POST /api/chat — SSE streaming ────────────────────────────────────────────
router.post('/chat', validateChat, async (req, res) => {
  const message = sanitizeString(req.body.message);

  // Set SSE headers — disable all buffering so tokens arrive immediately
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const emit  = (text) => res.write(`data: ${JSON.stringify({ text })}\n\n`);
  const done  = ()     => { res.write('data: [DONE]\n\n'); res.end(); };

  if (!genAI) {
    const reply = nexusLocalReply(message) || 'Je n\'ai pas trouvé de réponse précise. Pour plus d\'infos: comiteetuinfo@cegepstfe.ca ou 581 704-1221.';
    emit(reply);
    return done();
  }

  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `${NEXUS_CONTEXT}\n\nQuestion du joueur: ${message}`;
    const stream = await model.generateContentStream(prompt);

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) emit(text);
    }
    done();
  } catch (err) {
    console.error('[CHAT_ERROR]', err.message);
    const reply = nexusLocalReply(message) || 'Nexus déconnecté. Contacte-nous: comiteetuinfo@cegepstfe.ca ou 581 704-1221.';
    emit(reply);
    done();
  }
});

// ── GET /api/cagnotte ─────────────────────────────────────────────────────────
// Ticket d'Or + dons Twitch natifs uniquement — le don en ligne (Stripe) vit
// entièrement dans Supabase, lu directement par le front via useDonationCampaign().
router.get('/cagnotte', (_req, res) => {
  res.status(200).json({ success: true, data: getCagnotteState() });
});

// ── POST /api/admin/cagnotte/update (admin) ───────────────────────────────────
// Seul moyen de faire avancer twitchTotal (dons reçus directement sur le
// panneau natif Twitch, hors de portée d'un webhook) et d'ajuster ticketOrPrice.
router.post('/admin/cagnotte/update', requireAdmin, (req, res) => {
  const { twitchTotal, ticketOrPrice } = req.body || {};

  if (twitchTotal !== undefined && (typeof twitchTotal !== 'number' || twitchTotal < 0)) {
    return res.status(400).json({ error: 'twitchTotal doit être un nombre positif.' });
  }
  if (ticketOrPrice !== undefined && (typeof ticketOrPrice !== 'number' || ticketOrPrice <= 0)) {
    return res.status(400).json({ error: 'ticketOrPrice doit être un nombre positif.' });
  }

  adminUpdateCagnotte({ twitchTotal, ticketOrPrice });
  res.status(200).json({ success: true, data: getCagnotteState() });
});

// ── POST /api/cagnotte/ticket-or ──────────────────────────────────────────────
router.post('/cagnotte/ticket-or', async (req, res) => {
  const { name, email, quantity } = req.body || {};
  if (!name || !email || !quantity || quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Données invalides.' });
  }
  const sanitizedName = sanitizeString(String(name).slice(0, 80));
  const sanitizedEmail = sanitizeString(String(email).slice(0, 120));
  const qty = Math.max(1, Math.min(10, parseInt(quantity, 10)));
  const total = qty * getCagnotteState().ticketOrPrice;

  recordTicketOr({ qty, total });

  if (mailer) {
    try {
      await mailer.sendMail({
        from: `"Lan St-Jean - Cagnotte" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO || 'comiteetuinfo@cegepstfe.ca',
        replyTo: sanitizedEmail,
        subject: `[Lan St-Jean] Ticket d'Or — ${sanitizedName} — ${qty} ticket${qty > 1 ? 's' : ''} (${total}$)`,
        html: `<h2 style="color:#FFD700">Nouveau Ticket d'Or — Lan St-Jean</h2>
<table style="font-family:sans-serif;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold">Nom</td><td>${sanitizedName}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold">Courriel</td><td><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold">Quantité</td><td>${qty} ticket${qty > 1 ? 's' : ''}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold">Montant</td><td>${total}$</td></tr>
</table>
<p style="color:#888;font-size:12px">Paiement à finaliser sur place.</p>`,
      });
    } catch (err) {
      console.error('[TICKET_OR_EMAIL_ERROR]', err.message);
    }
  }

  console.log(`[TICKET_OR] ${sanitizedName} — ${qty} ticket(s) — ${total}$`);
  res.status(200).json({ success: true, message: 'Réservation reçue. Notre équipe vous contactera pour finaliser.' });
});

// ── POST /api/ticket-redirect ─────────────────────────────────────────────────
router.post('/ticket-redirect', validateTicketRequest, (req, res) => {
  const clean = sanitizeObject(req.body);
  console.log('[TICKET_REDIRECT]', clean.ticketType, '-', new Date().toISOString());
  const ticketUrl = process.env.TICKET_URL || 'https://billetterie.cstfelicien.qc.ca/lan2026';
  res.status(200).json({ success: true, redirectUrl: ticketUrl });
});

export default router;
