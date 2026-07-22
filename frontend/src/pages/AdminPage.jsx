import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Mail, Calendar, LogOut, ExternalLink, Settings, Zap,
  Ticket, Trophy, RefreshCw, ChevronDown, CheckCircle, AlertCircle, Swords,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fadeInUp, staggerContainer, pageTransition } from '../utils/animations.js';
import {
  getTicketsStatus, adminAdjustTickets,
  getTournaments, getTournament, getCompetitors,
  generateBracket, updateMatchScore, resetTournament,
} from '../utils/api.js';

const GAME_META = {
  lol:           { name: 'League of Legends', short: 'LoL',    icon: '⚔️',  color: '#C89B3C' },
  cs2:           { name: 'Counter-Strike 2',  short: 'CS2',    icon: '🔫',  color: '#FF4655' },
  rocket_league: { name: 'Rocket League',     short: 'Rocket', icon: '🚀',  color: '#4FC3F7' },
  magic_tg:      { name: 'Magic: TG',         short: 'Magic',  icon: '🃏',  color: '#9B59B6' },
  smash_bros:    { name: 'Super Smash Bros',  short: 'Smash',  icon: '👊',  color: '#FFD700' },
  mario_kart:    { name: 'Mario Kart',        short: 'MK',     icon: '🏎️', color: '#27AE60' },
};

const QUICK_LINKS = [
  { label: 'Dossier de partenariat (PDF)', href: '/partenariat.pdf', icon: ExternalLink, color: '#C89B3C', external: false },
  { label: 'Site Fondation du Cégep', href: 'https://fondationcstfelicien.qc.ca', icon: ExternalLink, color: '#FF4655', external: true },
  { label: 'Site du Cégep', href: 'https://www.cstfelicien.qc.ca', icon: ExternalLink, color: '#4FC3F7', external: true },
  { label: 'Google Cloud Console (OAuth)', href: 'https://console.cloud.google.com', icon: Settings, color: '#4285F4', external: true },
  { label: 'Azure Portal (Microsoft OAuth)', href: 'https://portal.azure.com', icon: Settings, color: '#7FBA00', external: true },
  { label: 'Page Compétitions (publique)', href: '/competitions', icon: Trophy, color: '#FFD700', external: false },
];

// ── Ticket Manager Section ────────────────────────────────────────────────────
function TicketManager() {
  const [status, setStatus] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(() => {
    getTicketsStatus().then(r => setStatus(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (type) => {
    const n = parseInt(editVal, 10);
    if (isNaN(n) || n < 0) return setErr('Valeur invalide.');
    setSaving(true);
    setErr(null);
    try {
      await adminAdjustTickets({ type, sold: n });
      setEditType(null);
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!status) return (
    <div className="flex items-center gap-2 font-mono text-zinc-600 text-xs">
      <RefreshCw size={12} className="animate-spin" /> Chargement...
    </div>
  );

  const types = ['visiteur', 'joueur', 'competiteur'];
  const typeColors = { visiteur: '#4FC3F7', joueur: '#C89B3C', competiteur: '#FFD700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-ember-500 text-xs tracking-widest uppercase">Inventaire des billets</p>
        <div className="flex items-center gap-2">
          {status.salesClosed && (
            <span className="font-mono text-red-400 text-[9px] tracking-widest uppercase border border-red-500/30 px-2 py-0.5">
              Ventes fermées
            </span>
          )}
          <button onClick={load} className="text-zinc-600 hover:text-ember-400 transition-colors">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {types.map(type => {
          const inv = status.inventory[type];
          const color = typeColors[type];
          const pct = Math.round((inv.sold / inv.capacity) * 100);
          const isEditing = editType === type;

          return (
            <div
              key={type}
              className="border border-zinc-800 bg-obsidian-800/60 p-3"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 rounded-full" style={{ background: color }} />
                  <span className="font-display text-white text-sm font-bold capitalize">{type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs" style={{ color }}>
                    {inv.sold} / {inv.capacity} vendus
                  </span>
                  <button
                    onClick={() => { setEditType(type); setEditVal(String(inv.sold)); setErr(null); }}
                    className="font-mono text-zinc-600 hover:text-ember-400 text-[9px] tracking-widest uppercase transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              </div>

              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <p className="font-mono text-zinc-700 text-[8px]">
                {inv.remaining} places restantes ({pct}% vendu)
              </p>

              {isEditing && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={inv.capacity}
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    className="flex-1 bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white text-sm px-2 py-1.5 outline-none font-mono"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
                  />
                  <button
                    onClick={() => handleSave(type)}
                    disabled={saving}
                    className="px-3 py-1.5 bg-ember-400 text-obsidian-900 font-display font-bold text-[10px] tracking-widest uppercase clip-diagonal disabled:opacity-50"
                  >
                    {saving ? '...' : 'OK'}
                  </button>
                  <button
                    onClick={() => setEditType(null)}
                    className="font-mono text-zinc-600 hover:text-zinc-400 text-xs px-1 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {err && (
        <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-2 mt-2">
          <AlertCircle size={11} /> {err}
        </div>
      )}
    </div>
  );
}

// ── Score editor for a single match ──────────────────────────────────────────
function MatchScoreRow({ match, game, color, onUpdated }) {
  const [s1, setS1] = useState(match.score1 ?? '');
  const [s2, setS2] = useState(match.score2 ?? '');
  const [saving, setSaving] = useState(false);

  if (match.status === 'bye' || !match.team1 || !match.team2) return null;

  const isDone = match.status === 'completed';
  const inputBase = "w-12 text-center bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white text-sm px-1 py-1 outline-none font-mono transition-colors";

  const save = async () => {
    const n1 = parseInt(s1, 10);
    const n2 = parseInt(s2, 10);
    if (isNaN(n1) || isNaN(n2) || n1 < 0 || n2 < 0 || n1 === n2) return;
    setSaving(true);
    try {
      await updateMatchScore(match.id, { game, score1: n1, score2: n2 });
      onUpdated();
    } catch {}
    setSaving(false);
  };

  return (
    <div className={`flex items-center gap-2 py-1.5 px-2 rounded ${isDone ? 'opacity-60' : ''}`}>
      {/* Team 1 */}
      <span className="font-mono text-[10px] text-zinc-400 flex-1 text-right truncate max-w-[100px]" title={match.team1?.name}>
        {match.winner?.id === match.team1?.id
          ? <span style={{ color }}>⚡ {match.team1?.name}</span>
          : match.team1?.name}
      </span>
      {/* Scores */}
      <input type="number" min="0" value={s1} onChange={e => setS1(e.target.value)}
        className={inputBase} disabled={isDone} />
      <span className="font-mono text-zinc-700 text-xs">vs</span>
      <input type="number" min="0" value={s2} onChange={e => setS2(e.target.value)}
        className={inputBase} disabled={isDone} />
      {/* Team 2 */}
      <span className="font-mono text-[10px] text-zinc-400 flex-1 truncate max-w-[100px]" title={match.team2?.name}>
        {match.winner?.id === match.team2?.id
          ? <span style={{ color }}>⚡ {match.team2?.name}</span>
          : match.team2?.name}
      </span>
      {/* Save button */}
      {!isDone && (
        <button
          onClick={save}
          disabled={saving || s1 === '' || s2 === '' || parseInt(s1, 10) === parseInt(s2, 10)}
          className="px-2 py-1 bg-ember-400/20 border border-ember-400/40 text-ember-300 hover:bg-ember-400/30 font-mono text-[9px] tracking-widest uppercase transition-colors disabled:opacity-30"
          style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          {saving ? '...' : 'OK'}
        </button>
      )}
      {isDone && (
        <span className="font-mono text-[8px] text-green-600 tracking-widest uppercase pl-1">✓</span>
      )}
    </div>
  );
}

// ── Tournament Manager Section ────────────────────────────────────────────────
function TournamentManager() {
  const [tournaments, setTournaments] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [bracketData, setBracketData]   = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [showCompetitors, setShowCompetitors] = useState(false);

  const load = useCallback(() => {
    Promise.all([getTournaments(), getCompetitors()])
      .then(([t, c]) => { setTournaments(t.data || []); setCompetitors(c.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load full bracket when a tournament is expanded
  const loadBracket = useCallback(async (game) => {
    try {
      const res = await getTournament(game);
      setBracketData(prev => ({ ...prev, [game]: res.data }));
    } catch {}
  }, []);

  const handleExpand = (game) => {
    const next = expanded === game ? null : game;
    setExpanded(next);
    if (next) loadBracket(next);
  };

  const handleGenerate = async (game) => {
    setGenerating(game);
    try {
      await generateBracket(game);
      load();
      loadBracket(game);
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerating(null);
    }
  };

  const handleReset = async (game) => {
    if (!window.confirm(`Réinitialiser le bracket de ${GAME_META[game]?.short}?`)) return;
    setResetting(game);
    try {
      await resetTournament(game);
      setBracketData(prev => ({ ...prev, [game]: null }));
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setResetting(null);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 font-mono text-zinc-600 text-xs">
      <RefreshCw size={12} className="animate-spin" /> Chargement...
    </div>
  );

  const statusBadge = (t) => {
    if (t.status === 'completed') return { label: 'Terminé', color: '#22c55e' };
    if (t.status === 'bracket') return { label: 'En cours', color: '#C89B3C' };
    return { label: 'Inscriptions', color: '#4FC3F7' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-ember-500 text-xs tracking-widest uppercase">Gestion des tournois</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompetitors(!showCompetitors)}
            className="font-mono text-zinc-600 hover:text-ember-400 text-[9px] tracking-widest uppercase transition-colors flex items-center gap-1"
          >
            <Users size={10} />
            {competitors.length} compétiteur{competitors.length !== 1 ? 's' : ''}
          </button>
          <button onClick={load} className="text-zinc-600 hover:text-ember-400 transition-colors">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Competitors list */}
      <AnimatePresence>
        {showCompetitors && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="border border-zinc-800 bg-obsidian-900/60 p-3 max-h-48 overflow-y-auto">
              {competitors.length === 0 ? (
                <p className="font-mono text-zinc-700 text-xs text-center py-2">Aucun compétiteur inscrit</p>
              ) : (
                <div className="space-y-1">
                  {competitors.map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between font-mono text-[10px] py-1 border-b border-zinc-800/50 last:border-0">
                      <span className="text-zinc-400">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600">{c.captainEmail}</span>
                        <span style={{ color: GAME_META[c.game]?.color || '#C89B3C' }}>
                          {GAME_META[c.game]?.short || c.game}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tournament list */}
      <div className="space-y-2">
        {tournaments.map(t => {
          const meta   = GAME_META[t.game] || {};
          const badge  = statusBadge(t);
          const isExp  = expanded === t.game;
          const bdata  = bracketData[t.game];
          const color  = meta.color || '#C89B3C';

          return (
            <div
              key={t.game}
              className="border border-zinc-800 bg-obsidian-800/60"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => handleExpand(t.game)}
              >
                <div className="flex items-center gap-3">
                  <span>{meta.icon || '🎮'}</span>
                  <div>
                    <p className="font-display text-white text-sm font-bold">{meta.short || t.game}</p>
                    <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase">
                      {t.teamsCount} équipe{t.teamsCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border"
                    style={{ color: badge.color, borderColor: `${badge.color}40`, background: `${badge.color}10` }}
                  >
                    {badge.label}
                  </span>
                  <motion.span animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-zinc-600" />
                  </motion.span>
                </div>
              </button>

              <AnimatePresence>
                {isExp && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-zinc-800/60 pt-3 space-y-4">

                      {/* Actions row */}
                      <div className="flex flex-wrap gap-2">
                        {!t.generated ? (
                          <button
                            onClick={() => handleGenerate(t.game)}
                            disabled={generating === t.game || t.teamsCount < 2}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-ember-400 text-obsidian-900 font-display font-bold text-[10px] tracking-widest uppercase clip-diagonal disabled:opacity-40"
                          >
                            <Swords size={10} />
                            {generating === t.game ? 'Génération...' : 'Générer bracket'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReset(t.game)}
                            disabled={resetting === t.game}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono text-[10px] tracking-widest uppercase transition-colors"
                          >
                            <RefreshCw size={10} />
                            {resetting === t.game ? '...' : 'Réinitialiser'}
                          </button>
                        )}
                        <Link
                          to="/competitions"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 font-mono text-[10px] tracking-widest uppercase transition-colors"
                        >
                          <Trophy size={10} />
                          Voir bracket
                        </Link>
                      </div>

                      {/* Score editor — only when bracket is generated */}
                      {t.generated && bdata?.rounds && bdata.rounds.length > 0 && (
                        <div className="border border-zinc-800/80 bg-obsidian-900/50 p-3 space-y-3">
                          <p className="font-mono text-[9px] tracking-[0.4em] uppercase mb-2" style={{ color }}>
                            Saisie des scores
                          </p>
                          {bdata.rounds.map(round => {
                            const playableMatches = round.matches.filter(m => m.team1 && m.team2 && m.status !== 'bye');
                            if (playableMatches.length === 0) return null;
                            const roundNames = ['Quarts', 'Demi-finales', 'Finale'];
                            const totalRounds = bdata.rounds.length;
                            const roundName = round.roundNumber >= totalRounds
                              ? 'Finale'
                              : round.roundNumber === totalRounds - 1
                                ? 'Demi-finales'
                                : `Round ${round.roundNumber}`;

                            return (
                              <div key={round.roundNumber}>
                                <p className="font-mono text-[8px] tracking-widest text-zinc-700 uppercase mb-1.5 pl-2">
                                  {roundName}
                                </p>
                                <div className="space-y-0.5">
                                  {playableMatches.map(match => (
                                    <MatchScoreRow
                                      key={match.id}
                                      match={match}
                                      game={t.game}
                                      color={color}
                                      onUpdated={() => { loadBracket(t.game); load(); }}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isAdmin, logout } = useAuth();

  if (!isAdmin) return <Navigate to="/" replace />;

  const daysToEvent = Math.max(0, Math.floor((new Date('2026-10-09') - new Date()) / 86400000));

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-20 relative overflow-hidden"
    >
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <div className="absolute inset-0 opacity-[0.012]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(200,155,60,0.5) 40px, rgba(200,155,60,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(200,155,60,0.5) 40px, rgba(200,155,60,0.5) 41px)' }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-12">
          <motion.p variants={fadeInUp} className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4">
            [ Panneau d'administration ]
          </motion.p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <motion.div variants={fadeInUp}>
              <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                Admin <span className="text-ember-300 text-ember-glow">Panel</span>
              </h1>
              <p className="font-body text-zinc-500 mt-2 text-sm">
                Bienvenue, {user?.name} · <span className="text-ember-500">{user?.email}</span>
              </p>
            </motion.div>
            <motion.button
              variants={fadeInUp}
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 transition-all font-mono text-xs tracking-widest"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={13} />
              Déconnexion
            </motion.button>
          </div>
          <div className="h-px max-w-sm mt-6 bg-gradient-to-r from-ember-400/50 to-transparent" />
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Calendar, label: 'Jours avant l\'event', value: daysToEvent, color: '#C89B3C' },
            { icon: Users,    label: 'Capacité totale',     value: '150+',      color: '#4FC3F7' },
            { icon: Mail,     label: 'Contact',             value: 'Actif',     color: '#22c55e' },
            { icon: Zap,      label: 'Édition',             value: '10e',       color: '#FFD700' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              variants={fadeInUp}
              className="border border-zinc-800 bg-obsidian-800/60 p-4 relative"
              style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
            >
              <Icon size={16} style={{ color }} className="mb-2" />
              <p className="font-display text-2xl font-bold text-white">{value}</p>
              <p className="font-mono text-zinc-600 text-[10px] tracking-widest uppercase mt-1">{label}</p>
              <div className="absolute top-0 right-0 w-2 h-2" style={{ background: color, opacity: 0.4 }} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main grid: ticket manager + tournament manager */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-zinc-800 bg-obsidian-800/40 p-5"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Ticket size={14} className="text-ember-400" />
              <span className="font-mono text-ember-500 text-xs tracking-widest uppercase">Billetterie</span>
            </div>
            <TicketManager />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="border border-zinc-800 bg-obsidian-800/40 p-5"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={14} className="text-ember-400" />
              <span className="font-mono text-ember-500 text-xs tracking-widest uppercase">Tournois</span>
            </div>
            <TournamentManager />
          </motion.div>
        </div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="font-mono text-ember-500 text-xs tracking-widest uppercase mb-4">Liens rapides</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_LINKS.map(({ label, href, icon: Icon, color, external }) => (
              <motion.a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-between px-4 py-3 border border-zinc-800 bg-obsidian-800/60 hover:border-zinc-600 transition-all group"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                whileHover={{ x: 3 }}
              >
                <span className="font-body text-zinc-400 group-hover:text-zinc-200 text-sm transition-colors truncate">{label}</span>
                <Icon size={13} style={{ color }} className="flex-shrink-0 ml-2" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* .env reminder */}
        <motion.div
          className="border border-ember-400/20 bg-ember-400/5 p-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
        >
          <p className="font-mono text-ember-500 text-[10px] tracking-widest uppercase mb-2">
            Fichier backend/.env — Variables requises
          </p>
          <pre className="font-mono text-xs text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">{`GEMINI_API_KEY=AIzaSy...          # Google AI Studio
GOOGLE_CLIENT_ID=...              # Google Cloud Console
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...           # Azure Portal
MICROSOFT_CLIENT_SECRET=...
JWT_SECRET=votre-secret-jwt
ADMIN_EMAIL=gabrielherve94@gmail.com
ADMIN_PASSWORD=VotreMotDePasse
SMTP_USER=votre.email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx    # App password Gmail
SMTP_TO=comiteetuinfo@cegepstfe.ca`}</pre>
        </motion.div>
      </div>
    </motion.div>
  );
}
