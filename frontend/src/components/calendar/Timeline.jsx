import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Clock, MapPin, Zap, Sword, Trophy, Star, Settings, Tv, Loader2 } from 'lucide-react';
import { scrollReveal, staggerContainer, fadeInUp, EASE_GAME } from '../../utils/animations.js';
import { getEvents } from '../../utils/api.js';

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
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    getEvents()
      .then((res) => {
        if (cancelled) return;
        setEvents(res.data || []);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  const filteredEvents = (date) =>
    events.filter((e) => e.date === date && (filter === 'all' || e.category === filter));

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

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-3 py-20 font-mono text-zinc-600 text-xs tracking-widest uppercase">
          <Loader2 size={14} className="animate-spin text-ember-500" />
          Chargement du programme...
        </div>
      )}

      {status === 'error' && (
        <p className="text-center font-mono text-red-400 text-xs tracking-widest uppercase py-20">
          Impossible de charger le programme. Réessaie plus tard.
        </p>
      )}

      {status === 'ready' && (
        <>
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
        </>
      )}
    </section>
  );
}
