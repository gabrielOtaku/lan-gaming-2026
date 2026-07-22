import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Clock, MapPin, Zap, Sword, Trophy, Star, Settings, Tv } from 'lucide-react';
import { scrollReveal, staggerContainer, fadeInUp, EASE_GAME } from '../../utils/animations.js';

const EVENTS = [
  // ── Vendredi 9 oct ───────────────────────────────────────────────────────────
  { id: 1,  date: '2026-10-09', day: 'Vendredi', startTime: '18:00', endTime: '19:00', title: 'Arrivée et installation', description: 'Accueil des participants, vérification des billets, attribution des postes et branchements. DJ local ou playlist gaming pour mettre l\'ambiance dès l\'arrivée.', location: 'Arènes de jeu', category: 'setup', color: '#636E72' },
  { id: 2,  date: '2026-10-09', day: 'Vendredi', startTime: '19:00', endTime: '19:30', title: 'Cérémonie d\'ouverture & Formation des équipes', description: 'Bienvenue au micro, présentation des règles, du planning et des prix. Ouverture des buffets. Début de la création d\'équipes pour les tournois via Discord dédié.', location: 'Salle Azimut', category: 'show', color: '#FFD700' },
  { id: 3,  date: '2026-10-09', day: 'Vendredi', startTime: '19:30', endTime: '22:30', title: 'Qualifications — Phase 1', description: 'Lancement des premiers matchs de qualification pour tous les tournois simultanément. Stream A (LoL) et Stream B (CS2) sur Twitch en direct.', location: 'Toutes les arènes', category: 'tournament', color: '#C89B3C' },
  { id: 4,  date: '2026-10-09', day: 'Vendredi', startTime: '22:30', endTime: '01:00', title: 'Soirée détente & Mini-jeux', description: 'Break des tournois majeurs. Tournoi de jeu de combat sur console (Super Smash Bros, Street Fighter) sur grand écran. Rocket League, Jackbox Games, jeux de cartes (Magic, Pokémon) et jeux de société.', location: 'Zone consoles', category: 'activity', color: '#E74C3C' },
  // ── Samedi 10 oct ────────────────────────────────────────────────────────────
  { id: 5,  date: '2026-10-10', day: 'Samedi', startTime: '10:00', endTime: '12:00', title: 'Tournois & Jeux libres', description: 'Poursuite des matchs de qualification des tournois principaux — LoL, CS2 et Rocket League. Gaming libre en parallèle sur tous les postes.', location: 'Toutes les arènes', category: 'tournament', color: '#C89B3C' },
  { id: 6,  date: '2026-10-10', day: 'Samedi', startTime: '12:00', endTime: '13:00', title: 'Pause déjeuner', description: 'Repas servi sur place. Les jeux libres restent accessibles pendant la pause.', location: 'Zone buffet', category: 'break', color: '#27AE60' },
  { id: 7,  date: '2026-10-10', day: 'Samedi', startTime: '13:00', endTime: '15:00', title: 'Conférence & Temps fort pour le public', description: 'Accueil d\'une entreprise ou d\'un invité spécial. Zone de jeux rétro (consoles, bornes d\'arcade) disponible en parallèle pour ceux qui préfèrent jouer.', location: 'Salle Azimut', category: 'show', color: '#4FC3F7' },
  { id: 8,  date: '2026-10-10', day: 'Samedi', startTime: '15:00', endTime: '17:00', title: 'Deuxième vague de qualifications', description: 'Poursuite et fin des matchs de qualification. Grands huitièmes et quarts de finale de certains tournois peuvent commencer.', location: 'Toutes les arènes', category: 'tournament', color: '#C89B3C' },
  { id: 9,  date: '2026-10-10', day: 'Samedi', startTime: '17:00', endTime: '18:30', title: 'Animations physiques & Divertissements', description: 'Option 1 : Airsoft / Initiation boxe ou sumo (encadré par un professionnel) / Tournoi de ping-pong. Option 2 : Jeux de société géants (Jenga, Twister) ou Speedrun challenge.', location: 'Zone activités', category: 'activity', color: '#FF6B35' },
  { id: 10, date: '2026-10-10', day: 'Samedi', startTime: '18:30', endTime: '20:00', title: 'Pause repas', description: 'Repas du soir servi sur place. Musique d\'ambiance et jeux libres.', location: 'Zone buffet', category: 'break', color: '#27AE60' },
  { id: 11, date: '2026-10-10', day: 'Samedi', startTime: '20:00', endTime: '22:00', title: 'Quarts et demi-finales — Scène principale', description: 'Les matchs les plus attendus joués sur la scène principale, diffusés en direct sur Twitch avec commentateurs.', location: 'Salle Azimut — Scène principale', category: 'final', color: '#FFD700' },
  { id: 12, date: '2026-10-10', day: 'Samedi', startTime: '22:00', endTime: '00:00', title: 'Quiz géant & Soirée ambiance', description: 'Kahoot géant ouvert à tous! Animation musicale et jeux libres jusqu\'au bout de la nuit. La nuit appartient aux guerriers.', location: 'Salle Azimut', category: 'activity', color: '#9B59B6' },
  // ── Dimanche 11 oct ──────────────────────────────────────────────────────────
  { id: 13, date: '2026-10-11', day: 'Dimanche', startTime: '10:00', endTime: '12:00', title: 'Matchs pour la 3e place & Révisions', description: 'Petites finales et matchs de classement. Temps libre pour que les finalistes se préparent mentalement aux grandes finales de l\'après-midi.', location: 'Arènes de jeu', category: 'tournament', color: '#FF4655' },
  { id: 14, date: '2026-10-11', day: 'Dimanche', startTime: '12:00', endTime: '13:00', title: 'Pause déjeuner', description: 'Dernier repas avant les grandes finales. Montée en adrénaline garantie.', location: 'Zone buffet', category: 'break', color: '#27AE60' },
  { id: 15, date: '2026-10-11', day: 'Dimanche', startTime: '13:00', endTime: '16:00', title: 'Grandes Finales — Live Twitch Charité', description: 'Finales LoL, CS2 et Rocket League sur grand écran avec commentateurs, éclairages et ambiance de finale. Rotation des finales pour que tout le monde puisse suivre. 100% des dons Twitch reversés à la Fondation.', location: 'Salle Azimut — Scène principale', category: 'final', color: '#FFD700' },
  { id: 16, date: '2026-10-11', day: 'Dimanche', startTime: '16:00', endTime: '17:00', title: 'Cérémonie de remise des prix', description: 'Remise des trophées et lots aux vainqueurs. Remerciements aux participants, bénévoles et sponsors. Photo de groupe officielle. Annonce du total reversé à la Fondation.', location: 'Salle Azimut', category: 'ceremony', color: '#FFD700' },
  { id: 17, date: '2026-10-11', day: 'Dimanche', startTime: '17:00', endTime: '18:00', title: 'Démontage', description: 'Rangement et nettoyage des lieux. Merci à tous d\'avoir fait de LAN Gaming 2026 une histoire indélébile!', location: 'Toutes les salles', category: 'setup', color: '#636E72' },
];

const CATEGORY_CONFIG = {
  tournament: { label: 'Tournoi', icon: Sword, color: '#C89B3C' },
  final: { label: 'Finale', icon: Trophy, color: '#FFD700' },
  show: { label: 'Show', icon: Tv, color: '#4FC3F7' },
  ceremony: { label: 'Cérémonie', icon: Star, color: '#FFD700' },
  setup: { label: 'Logistique', icon: Settings, color: '#636E72' },
  activity: { label: 'Animation', icon: Zap, color: '#FF6B35' },
  break: { label: 'Repas', icon: Clock, color: '#27AE60' },
};

const DAYS = ['2026-10-09', '2026-10-10', '2026-10-11'];
const DAY_LABELS = {
  '2026-10-09': { day: 'VENDREDI', date: '9 OCT', num: '9' },
  '2026-10-10': { day: 'SAMEDI', date: '10 OCT', num: '10' },
  '2026-10-11': { day: 'DIMANCHE', date: '11 OCT', num: '11' },
};

// ── Single event card ─────────────────────────────────────────────────────────
function EventCard({ event, index }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const catConfig = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.setup;
  const Icon = catConfig.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.6, ease: EASE_GAME }}
      className="relative flex gap-4 md:gap-6"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          className="w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1.5"
          style={{ borderColor: event.color, backgroundColor: `${event.color}30` }}
          animate={{ boxShadow: [`0 0 0px ${event.color}00`, `0 0 12px ${event.color}80`, `0 0 6px ${event.color}40`] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div
          className="w-px flex-1 mt-2"
          style={{ background: `linear-gradient(to bottom, ${event.color}40, transparent)`, minHeight: '32px' }}
        />
      </div>

      {/* Card */}
      <motion.div
        className="flex-1 mb-6 border bg-glass cursor-pointer group"
        style={{ borderColor: `${event.color}20` }}
        onClick={() => setExpanded(!expanded)}
        whileHover={{ borderColor: `${event.color}50`, boxShadow: `0 0 25px ${event.color}15` }}
        transition={{ duration: 0.2 }}
      >
        {/* Card header */}
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Category badge + time */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm" style={{ background: `${event.color}15`, border: `1px solid ${event.color}30` }}>
                  <Icon size={10} style={{ color: event.color }} />
                  <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: event.color }}>
                    {catConfig.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-zinc-600" />
                  <span className="font-mono text-zinc-500 text-xs">{event.startTime} – {event.endTime}</span>
                </div>
              </div>

              <h4 className="font-display font-bold text-white text-sm md:text-base group-hover:text-ember-200 transition-colors leading-snug">
                {event.title}
              </h4>
            </div>

            {/* Expand icon */}
            <motion.div
              className="flex-shrink-0 mt-1"
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-5 h-5 border border-zinc-700 group-hover:border-ember-400/50 flex items-center justify-center transition-colors">
                <span className="text-zinc-600 group-hover:text-ember-400 transition-colors text-xs font-bold">+</span>
              </div>
            </motion.div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-2">
            <MapPin size={11} className="text-zinc-700" />
            <span className="font-mono text-zinc-600 text-xs">{event.location}</span>
          </div>
        </div>

        {/* Expanded description */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_GAME }}
              className="overflow-hidden"
            >
              <div
                className="px-4 md:px-5 pb-4 pt-0 border-t"
                style={{ borderColor: `${event.color}15` }}
              >
                <p className="font-body text-zinc-400 text-sm leading-relaxed mt-3">
                  {event.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Day column ────────────────────────────────────────────────────────────────
function DayColumn({ date, events, isActive }) {
  const info = DAY_LABELS[date];
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="flex-1 min-w-[280px]"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Day header */}
      <div className="mb-8 relative">
        <div className="flex items-center gap-4 mb-4">
          {/* Day number */}
          <div
            className="w-14 h-14 clip-hex flex items-center justify-center bg-obsidian-700 border border-ember-400/20 flex-shrink-0"
            style={{ borderColor: isActive ? 'rgba(200,155,60,0.5)' : 'rgba(200,155,60,0.15)' }}
          >
            <span className="font-display text-xl font-black text-ember-300">{info.num}</span>
          </div>

          <div>
            <p className="font-display font-black text-white text-lg tracking-wide leading-none">{info.day}</p>
            <p className="font-mono text-ember-500 text-xs tracking-widest mt-1">{info.date} · 2026</p>
          </div>
        </div>

        {/* Separator */}
        <div
          className="h-px"
          style={{ background: 'linear-gradient(to right, rgba(200,155,60,0.4), transparent)' }}
        />
      </div>

      {/* Events */}
      <div>
        {events.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}

        {events.length === 0 && (
          <p className="font-mono text-zinc-700 text-xs tracking-widest text-center py-8">
            Aucun événement
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
function FilterTabs({ active, onChange }) {
  const categories = [
    { key: 'all', label: 'Tous' },
    { key: 'tournament', label: 'Tournois' },
    { key: 'final', label: 'Finales' },
    { key: 'show', label: 'Shows' },
    { key: 'activity', label: 'Animations' },
    { key: 'ceremony', label: 'Cérémonie' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
      {categories.map(({ key, label }) => (
        <motion.button
          key={key}
          onClick={() => onChange(key)}
          className={`font-mono text-xs tracking-widest uppercase px-4 py-1.5 border transition-all duration-200 ${
            active === key
              ? 'border-ember-400 bg-ember-400/10 text-ember-300'
              : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function Timeline() {
  const [filter, setFilter] = useState('all');

  const filteredEvents = (date) =>
    EVENTS.filter((e) => e.date === date && (filter === 'all' || e.category === filter));

  return (
    <section className="relative">
      {/* Section header */}
      <div className="text-center mb-16">
        <motion.p
          className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          [ Programme complet ]
        </motion.p>
        <motion.h2
          className="font-display text-4xl md:text-6xl font-black text-white uppercase tracking-tight"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Calendrier des{' '}
          <span className="text-ember-300 text-ember-glow">Combats</span>
        </motion.h2>
        <motion.p
          className="font-body text-zinc-500 max-w-lg mx-auto mt-4 text-sm"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Trois jours d'action non-stop. Cliquez sur un événement pour voir les détails.
        </motion.p>
      </div>

      <FilterTabs active={filter} onChange={setFilter} />

      {/* 3-column day layout */}
      <div className="flex gap-6 md:gap-10 overflow-x-auto pb-6 -mx-6 px-6">
        {DAYS.map((date) => (
          <DayColumn
            key={date}
            date={date}
            events={filteredEvents(date)}
            isActive={false}
          />
        ))}
      </div>
    </section>
  );
}
