import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import { validateContact, validateTicketRequest, validateChat } from '../middlewares/validate.js';
import { sanitizeObject, sanitizeString } from '../utils/sanitize.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import { loadJSON, saveJSON } from '../utils/persist.js';
import { getCagnotteState, recordTicketOr, adminUpdateCagnotte } from '../utils/cagnotteStore.js';

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

const NEXUS_CONTEXT = `Tu es NEXUS, l'assistant IA officiel de l'événement LAN Gaming 2026 au Cégep de Saint-Félicien.
Ton style est direct, précis, avec une touche "gaming/esport" — tu utilises parfois des termes gaming mais tu restes professionnel.
Réponds TOUJOURS en français québécois, de façon concise (maximum 3-4 phrases).
Tu connais parfaitement ces informations sur l'événement:

DATES ET LIEU:
- Dates: 9, 10 et 11 octobre 2026 (47h de gaming non-stop)
- Lieu: Cégep de Saint-Félicien, 525 Boul. Hamel, Saint-Félicien, Québec G8K 2R8
- Contact: comiteetuinfo@cegepstfe.ca | Téléphone: 581 704-1221
- Co-organisateurs: Gabriel Hervé et Jovan Knezevic

HORAIRE (source unique: le calendrier détaillé de la page Calendrier — ne pas
donner d'heures qui contredisent celui-ci):
- Vendredi 9 oct 18h00: Arrivée et installation des joueurs
- Vendredi 9 oct 19h00: Cérémonie d'ouverture à la Salle Azimut
- Vendredi 9 oct 19h30: Début des qualifications (LoL, CS2, Rocket League)
- Samedi 10 oct 10h00-17h00: Tournois et qualifications
- Samedi 10 oct 13h00-15h00: Conférence et temps fort pour le public
- Samedi 10 oct 20h00-22h00: Quarts et demi-finales sur la scène principale
- Dimanche 11 oct 10h00-12h00: Matchs pour la 3e place
- Dimanche 11 oct 13h00-16h00: Grandes finales en direct sur Twitch (charité)
- Dimanche 11 oct 16h00: Cérémonie de remise des prix

BILLETS:
- Visiteur: 15$ — accès libre à l'événement, zone spectateurs, consoles, arcade
- Joueur: 30$ — poste LAN fixe, arènes, badge joueur (17 ans et plus requis)
- Compétiteur: 45$ — tout du joueur + inscription aux tournois officiels, éligible aux cash prizes
- Limite: 1 PC + 1 écran max par joueur ou compétiteur
- Capacité: 150+ participants

TOURNOIS:
- League of Legends (LoL)
- Counter-Strike 2 (CS2)
- Rocket League
- Magic: The Gathering
- Super Smash Bros
- Mario Kart

PARTENAIRES CONFIRMÉS:
- Cégep de Saint-Félicien (organisateur principal)
- Metro (partenaire Diamant)
- Centre Hi-Fi (partenaire Diamant)
- Mazda (partenaire Or)
- e-distribution (partenaire Or)

FONDATION:
- 15% des profits nets reversés à la Fondation du Cégep de Saint-Félicien
- La Fondation distribue 30 000$ à 50 000$ en bourses par an (deux programmes d'aide)
- Grande finale du dimanche streamée sur Twitch pour maximiser les dons

INFORMATIONS SUPPLÉMENTAIRES:
- LAN Gaming 2026 relance l'esprit de la toute première LAN Gaming CSF (avril 2023, 70+ participants) avec une nouvelle équipe étudiante — un événement en pleine croissance au Saguenay–Lac-Saint-Jean
- Trois espaces: Salle Azimut (scène principale), arènes de jeu, zone consoles
- 17 ans et plus pour les joueurs et compétiteurs

Si tu ne sais pas quelque chose sur l'événement, dis-le honnêtement et redirige vers comiteetuinfo@cegepstfe.ca.
Ne réponds PAS aux questions hors-sujet (politique, médecine, etc.) — recentre sur l'événement.`;

// ── NEXUS Smart Local FAQ (fallback sans API Gemini) ─────────────────────────
const NEXUS_FAQ = [
  {
    keywords: ['quand', 'date', 'dates', 'octobre', 'quand est', 'pendant', 'horaire'],
    response: "LAN Gaming 2026 se déroule du 9 au 11 octobre 2026 — 47h de gaming non-stop! Ça débute vendredi le 9 à 17h00 avec le bal d'ouverture à la Salle Azimut.",
  },
  {
    keywords: ['billet', 'billets', 'ticket', 'prix', 'coût', 'combien', 'tarif', 'payer', 'achat'],
    response: "Visiteur: 15$ | Joueur: 30$ (poste LAN fixe, 17 ans+) | Compétiteur: 45$ (joueur + tournois officiels, cash prizes). Limite de 150 participants — réserve vite!",
  },
  {
    keywords: ['tournoi', 'tournois', 'jeu', 'jeux', 'lol', 'league', 'cs2', 'counter', 'rocket', 'magic', 'smash', 'mario', 'compétition'],
    response: "Tournois officiels: League of Legends, Counter-Strike 2, Rocket League, Magic: The Gathering, Super Smash Bros et Mario Kart. Finales LoL/CS2 streamées sur Twitch dimanche pour la charité!",
  },
  {
    keywords: ['où', 'ou', 'lieu', 'adresse', 'cégep', 'cegep', 'saint-félicien', 'felicien', 'saguenay', 'lac'],
    response: "LAN Gaming 2026 a lieu au Cégep de Saint-Félicien, 525 Boul. Hamel, Saint-Félicien, QC G8K 2R8 — au cœur du Saguenay–Lac-Saint-Jean!",
  },
  {
    keywords: ['partenaire', 'partenaires', 'sponsor', 'commanditaire', 'metro', 'hi-fi', 'mazda', 'distribution'],
    response: "Partenaires confirmés: Metro (Diamant), Centre Hi-Fi (Diamant), Mazda (Or), e-distribution (Or). Tu veux devenir partenaire? Écris à comiteetuinfo@cegepstfe.ca!",
  },
  {
    keywords: ['fondation', 'bourse', 'bourses', 'charité', 'don', 'dons', 'twitch', 'stream'],
    response: "15% des profits nets vont à la Fondation du Cégep de Saint-Félicien (30 000–50 000$/an en bourses). La finale du dimanche est streamée sur Twitch pour maximiser les dons!",
  },
  {
    keywords: ['contact', 'courriel', 'email', 'téléphone', 'telephone', 'joindre', 'organisateur', 'équipe'],
    response: "Contacte-nous: comiteetuinfo@cegepstfe.ca ou 581 704-1221. Organisé par Gabriel Hervé et Jovan Knezevic, Comité Étudiant Informatique du Cégep de Saint-Félicien.",
  },
  {
    keywords: ['programme', 'schedule', 'vendredi', 'samedi', 'dimanche', 'calendrier', 'agenda'],
    response: "Ven 9: 18h arrivée, 19h cérémonie d'ouverture, 19h30 GRIND. Sam 10: 10h-17h tournois, 13h-15h conférence, 20h-22h quarts/demi-finales. Dim 11: 10h-12h matchs 3e place, 13h finales Twitch, 16h cérémonie!",
  },
  {
    keywords: ['âge', 'age', '17', 'mineur', 'jeune', 'requis', 'minimum'],
    response: "17 ans et plus requis pour les billets Joueur et Compétiteur. Les Visiteurs n'ont pas de restriction d'âge. Règle équipement: 1 PC + 1 écran max par joueur.",
  },
  {
    keywords: ['équipement', 'equipement', 'pc', 'ordinateur', 'écran', 'setup', 'matériel', 'apporter'],
    response: "Chaque joueur/compétiteur apporte son propre matériel: 1 PC + 1 écran maximum. Le réseau est fourni sur place. Les visiteurs n'ont rien à apporter!",
  },
  {
    keywords: ['inscription', 'inscrire', 'comment', 'participer', 'enregistrement', 'register'],
    response: "Achète un billet Joueur (30$) ou Compétiteur (45$). Le billet Compétiteur inclut automatiquement l'inscription aux tournois officiels. Capacité: 150 participants!",
  },
  {
    keywords: ['remboursement', 'annulation', 'cancel', 'rembours'],
    response: "La date limite de remboursement est le 2 octobre 2026. Après cette date, les billets ne sont plus remboursables. Pour toute demande, contacte comiteetuinfo@cegepstfe.ca.",
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

// ── GET /api/tickets/status ───────────────────────────────────────────────────
router.get('/tickets/status', (_req, res) => {
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

  res.json({
    success: true,
    data: {
      deadline: TICKET_DEADLINE.toISOString(),
      deadlinePassed,
      allSoldOut,
      salesClosed,
      inventory: {
        visiteur:    { ...inv.visiteur,    remaining: remaining.visiteur },
        joueur:      { ...inv.joueur,      remaining: remaining.joueur },
        competiteur: { ...inv.competiteur, remaining: remaining.competiteur },
      },
    },
  });
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

// ── Tournament State ──────────────────────────────────────────────────────────
const GAMES = ['lol', 'cs2', 'rocket_league', 'magic_tg', 'smash_bros', 'mario_kart'];

const GAME_INFO = {
  lol:          { name: 'League of Legends', short: 'LoL',      icon: '⚔️',  color: '#C89B3C', teamSize: 5 },
  cs2:          { name: 'Counter-Strike 2',  short: 'CS2',      icon: '🔫',  color: '#FF4655', teamSize: 5 },
  rocket_league:{ name: 'Rocket League',     short: 'Rocket',   icon: '🚀',  color: '#4FC3F7', teamSize: 3 },
  magic_tg:     { name: 'Magic: The Gathering', short: 'Magic', icon: '🃏',  color: '#9B59B6', teamSize: 1 },
  smash_bros:   { name: 'Super Smash Bros',  short: 'Smash',    icon: '👊',  color: '#FFD700', teamSize: 1 },
  mario_kart:   { name: 'Mario Kart',        short: 'Mario K.', icon: '🏎️', color: '#27AE60', teamSize: 1 },
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

// ── Données de test : 16 équipes LoL + bracket généré ────────────────────────
const LOL_SEED_TEAMS = [
  { name: 'Team Noxus',          captainName: 'Gabriel H.',  captainEmail: 'captain1@lan2026.ca'  },
  { name: 'Les Demaciens',       captainName: 'Jovan K.',    captainEmail: 'captain2@lan2026.ca'  },
  { name: 'Shadow Isles Gaming', captainName: 'Marc T.',     captainEmail: 'captain3@lan2026.ca'  },
  { name: 'Ionia Drift',         captainName: 'Théo B.',     captainEmail: 'captain4@lan2026.ca'  },
  { name: 'Piltover Tech',       captainName: 'Alexis R.',   captainEmail: 'captain5@lan2026.ca'  },
  { name: 'Freljord 5',          captainName: 'Samuel G.',   captainEmail: 'captain6@lan2026.ca'  },
  { name: 'Void Hunters',        captainName: 'Félix M.',    captainEmail: 'captain7@lan2026.ca'  },
  { name: 'Bandle City Ballers', captainName: 'Antoine P.',  captainEmail: 'captain8@lan2026.ca'  },
  { name: 'Bilgewater Buccaneers', captainName: 'Noah C.',   captainEmail: 'captain9@lan2026.ca'  },
  { name: 'Hextech Syndicate',   captainName: 'Raphaël S.',  captainEmail: 'captain10@lan2026.ca' },
  { name: 'Dragon Court',        captainName: 'Liam D.',     captainEmail: 'captain11@lan2026.ca' },
  { name: 'The Iron Order',      captainName: 'Étienne V.',  captainEmail: 'captain12@lan2026.ca' },
  { name: 'Shurima Rising',      captainName: 'William F.',  captainEmail: 'captain13@lan2026.ca' },
  { name: 'Targon Ascended',     captainName: 'Charles B.',  captainEmail: 'captain14@lan2026.ca' },
  { name: 'Zaun Underground',    captainName: 'Olivier N.',  captainEmail: 'captain15@lan2026.ca' },
  { name: 'Ixtal Jungle',        captainName: 'Maxime L.',   captainEmail: 'captain16@lan2026.ca' },
];

// Seed LoL with demo data only if no saved state exists yet
const lolState = tournamentState['lol'];
if (lolState.teams.length === 0) {
  lolState.teams = LOL_SEED_TEAMS.map((t, i) => ({
    id: `lol_seed_${i + 1}`,
    name: t.name,
    game: 'lol',
    captainEmail: t.captainEmail,
    captainName: t.captainName,
    registeredAt: new Date().toISOString(),
  }));
  lolState.rounds   = generateBracket(lolState.teams);
  lolState.status   = 'bracket';
  lolState.generated = true;
  saveTournaments();
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

// ── GET /api/tournaments ──────────────────────────────────────────────────────
router.get('/tournaments', (_req, res) => {
  const data = GAMES.map(game => ({
    game,
    ...GAME_INFO[game],
    teamsCount: tournamentState[game].teams.length,
    status: tournamentState[game].status,
    generated: tournamentState[game].generated,
  }));
  res.json({ success: true, data });
});

// ── GET /api/tournaments/:game ────────────────────────────────────────────────
router.get('/tournaments/:game', (req, res) => {
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

// ── GET /api/events ──────────────────────────────────────────────────────────
router.get('/events', (_req, res) => {
  const events = [
    { id: 1,  date: '2026-10-09', startTime: '18:00', endTime: '19:00', title: 'Arrivée et installation', description: 'Accueil des participants, vérification des billets, attribution des postes. DJ local ou playlist gaming pour mettre l\'ambiance.', location: 'Arènes de jeu', category: 'setup', color: '#636E72' },
    { id: 2,  date: '2026-10-09', startTime: '19:00', endTime: '19:30', title: 'Cérémonie d\'ouverture & Formation des équipes', description: 'Bienvenue au micro, présentation des règles, du planning et des prix. Ouverture des buffets. Formation des équipes via Discord dédié.', location: 'Salle Azimut', category: 'show', color: '#FFD700' },
    { id: 3,  date: '2026-10-09', startTime: '19:30', endTime: '22:30', title: 'Qualifications — Phase 1', description: 'Lancement des premiers matchs de qualification pour tous les tournois simultanément. Stream A (LoL) et Stream B (CS2) sur Twitch.', location: 'Toutes les arènes', category: 'tournament', color: '#C89B3C', streamed: true },
    { id: 4,  date: '2026-10-09', startTime: '22:30', endTime: '01:00', title: 'Soirée détente & Mini-jeux', description: 'Break des tournois majeurs. Tournoi de jeu de combat sur console (Smash Bros, Street Fighter) sur grand écran. Rocket League, Jackbox Games, jeux de cartes (Magic, Pokémon) et jeux de société.', location: 'Zone consoles', category: 'activity', color: '#E74C3C' },
    { id: 5,  date: '2026-10-10', startTime: '10:00', endTime: '12:00', title: 'Tournois & Jeux libres', description: 'Poursuite des matchs de qualification — LoL, CS2 et Rocket League. Gaming libre en parallèle.', location: 'Toutes les arènes', category: 'tournament', color: '#C89B3C' },
    { id: 6,  date: '2026-10-10', startTime: '12:00', endTime: '13:00', title: 'Pause déjeuner', description: 'Repas servi sur place. Jeux libres accessibles pendant la pause.', location: 'Zone buffet', category: 'break', color: '#27AE60' },
    { id: 7,  date: '2026-10-10', startTime: '13:00', endTime: '15:00', title: 'Conférence & Temps fort pour le public', description: 'Accueil d\'une entreprise ou d\'un invité spécial. Zone de jeux rétro (consoles, bornes d\'arcade) disponible en parallèle.', location: 'Salle Azimut', category: 'show', color: '#4FC3F7' },
    { id: 8,  date: '2026-10-10', startTime: '15:00', endTime: '17:00', title: 'Deuxième vague de qualifications', description: 'Poursuite et fin des matchs de qualification. Huitièmes et quarts de finale de certains tournois.', location: 'Toutes les arènes', category: 'tournament', color: '#C89B3C' },
    { id: 9,  date: '2026-10-10', startTime: '17:00', endTime: '18:30', title: 'Animations physiques & Divertissements', description: 'Option 1 : Airsoft / Initiation boxe ou sumo / Ping-pong. Option 2 : Jeux de société géants (Jenga, Twister) ou Speedrun challenge.', location: 'Zone activités', category: 'activity', color: '#FF6B35' },
    { id: 10, date: '2026-10-10', startTime: '18:30', endTime: '20:00', title: 'Pause repas', description: 'Repas du soir. Musique d\'ambiance et jeux libres.', location: 'Zone buffet', category: 'break', color: '#27AE60' },
    { id: 11, date: '2026-10-10', startTime: '20:00', endTime: '22:00', title: 'Quarts et demi-finales — Scène principale', description: 'Les matchs les plus attendus sur la scène principale, diffusés en direct sur Twitch avec commentateurs.', location: 'Salle Azimut — Scène principale', category: 'final', color: '#FFD700', streamed: true },
    { id: 12, date: '2026-10-10', startTime: '22:00', endTime: '00:00', title: 'Quiz géant & Soirée ambiance', description: 'Kahoot géant ouvert à tous! Animation musicale et jeux libres jusqu\'au bout de la nuit.', location: 'Salle Azimut', category: 'activity', color: '#9B59B6' },
    { id: 13, date: '2026-10-11', startTime: '10:00', endTime: '12:00', title: 'Matchs pour la 3e place & Révisions', description: 'Petites finales et matchs de classement. Temps libre pour que les finalistes se préparent.', location: 'Arènes de jeu', category: 'tournament', color: '#FF4655' },
    { id: 14, date: '2026-10-11', startTime: '12:00', endTime: '13:00', title: 'Pause déjeuner', description: 'Dernier repas avant les grandes finales.', location: 'Zone buffet', category: 'break', color: '#27AE60' },
    { id: 15, date: '2026-10-11', startTime: '13:00', endTime: '16:00', title: 'Grandes Finales — Live Twitch Charité', description: 'Finales LoL, CS2 et Rocket League sur grand écran avec commentateurs, éclairages et ambiance de finale. Rotation des finales pour que tout le monde puisse suivre. 100% des dons Twitch à la Fondation.', location: 'Salle Azimut — Scène principale', category: 'final', color: '#FFD700', streamed: true },
    { id: 16, date: '2026-10-11', startTime: '16:00', endTime: '17:00', title: 'Cérémonie de remise des prix', description: 'Remise des trophées et lots aux vainqueurs. Remerciements aux participants, bénévoles et sponsors. Photo de groupe officielle.', location: 'Salle Azimut', category: 'ceremony', color: '#FFD700' },
    { id: 17, date: '2026-10-11', startTime: '17:00', endTime: '18:00', title: 'Démontage', description: 'Rangement et nettoyage des lieux. Merci à tous d\'avoir fait de LAN Gaming 2026 une histoire indélébile!', location: 'Toutes les salles', category: 'setup', color: '#636E72' },
  ];
  res.status(200).json({ success: true, data: events });
});

// ── GET /api/partners ────────────────────────────────────────────────────────
router.get('/partners', (_req, res) => {
  const partners = [
    { id: 1, name: 'Cégep de Saint-Félicien', logo: '/logos/cegep.svg', url: 'https://www.cstfelicien.qc.ca', tier: 'principal' },
    { id: 2, name: 'Fondation du Cégep', logo: '/logos/fondation.svg', url: '#fondation', tier: 'charitable' },
    { id: 3, name: 'Metro', logo: '/logos/metro.svg', url: 'https://www.metro.ca', tier: 'diamant' },
    { id: 4, name: 'Centre Hi-Fi', logo: '/logos/centrehifi.svg', url: '#', tier: 'diamant' },
    { id: 5, name: 'Mazda', logo: '/logos/mazda.svg', url: 'https://www.mazda.ca', tier: 'or' },
    { id: 6, name: 'e-distribution', logo: '/logos/edistribution.svg', url: '#', tier: 'or' },
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
        from: `"LAN Gaming 2026 - Boutique" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO || 'comiteetuinfo@cegepstfe.ca',
        replyTo: cleanEmail,
        subject: `[LAN 2026] Nouvelle commande boutique — ${cleanName} (${total}$)`,
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
        from: `"LAN Gaming 2026" <${process.env.SMTP_USER}>`,
        to: cleanEmail,
        subject: `[LAN Gaming 2026] Confirmation de ta commande — ${total}$`,
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
<p style="font-family:sans-serif"><strong>LAN Gaming 2026 — 9, 10 et 11 octobre 2026</strong><br>Cégep de Saint-Félicien, 525 Boul. Hamel, Saint-Félicien, QC</p>
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
        from: `"LAN Gaming 2026 - Contact" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO || 'comiteetuinfo@cegepstfe.ca',
        replyTo: clean.email,
        subject: `[LAN 2026] ${clean.subject} — ${clean.name}`,
        text: `Nom: ${clean.name}\nCourriel: ${clean.email}\nSujet: ${clean.subject}\n\n${clean.message}`,
        html: `<h2 style="color:#C89B3C">Nouveau message — LAN Gaming 2026</h2>
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
router.get('/cagnotte', (_req, res) => {
  res.status(200).json({ success: true, data: getCagnotteState() });
});

// ── POST /api/admin/cagnotte/update (admin) ───────────────────────────────────
// Seul moyen de faire avancer twitchTotal (dons reçus directement sur le
// panneau natif Twitch, hors de portée d'un webhook) et d'ajuster goal /
// ticketOrPrice. Les dons en ligne (donationsTotal), eux, n'avancent que via
// le webhook Stripe signé — voir routes/donations.js.
router.post('/admin/cagnotte/update', requireAdmin, (req, res) => {
  const { twitchTotal, goal, ticketOrPrice } = req.body || {};

  if (twitchTotal !== undefined && (typeof twitchTotal !== 'number' || twitchTotal < 0)) {
    return res.status(400).json({ error: 'twitchTotal doit être un nombre positif.' });
  }
  if (goal !== undefined && (typeof goal !== 'number' || goal <= 0)) {
    return res.status(400).json({ error: 'goal doit être un nombre positif.' });
  }
  if (ticketOrPrice !== undefined && (typeof ticketOrPrice !== 'number' || ticketOrPrice <= 0)) {
    return res.status(400).json({ error: 'ticketOrPrice doit être un nombre positif.' });
  }

  adminUpdateCagnotte({ twitchTotal, goal, ticketOrPrice });
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
        from: `"LAN Gaming 2026 - Cagnotte" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO || 'comiteetuinfo@cegepstfe.ca',
        replyTo: sanitizedEmail,
        subject: `[LAN 2026] Ticket d'Or — ${sanitizedName} — ${qty} ticket${qty > 1 ? 's' : ''} (${total}$)`,
        html: `<h2 style="color:#FFD700">Nouveau Ticket d'Or — LAN Gaming 2026</h2>
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
