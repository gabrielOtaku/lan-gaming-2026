import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Radio,
  ExternalLink,
  Heart,
  Trophy,
  Clock,
  MapPin,
  RefreshCw,
  Bell,
} from "lucide-react";
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  scrollReveal,
} from "../utils/animations.js";
import { getEvents, getCagnotte } from "../utils/api.js";

const TWITCH_CHANNEL_URL = "https://www.twitch.tv/langamingcsf";
const TWITCH_EMBED_MINUTES_BEFORE = 120; // "bientôt en direct" dès 2h avant le prochain segment streamé

// Construit un Date en heure de l'Est (Québec est en EDT, UTC-4, début octobre) —
// même convention que TICKET_DEADLINE dans routes/api.js.
function toEasternDate(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00-04:00`);
}

function computeStreamStatus(events, now) {
  const streamed = (events || [])
    .filter((e) => e.streamed)
    .map((e) => ({
      ...e,
      start: toEasternDate(e.date, e.startTime),
      end: toEasternDate(e.date, e.endTime),
    }))
    .sort((a, b) => a.start - b.start);

  const current = streamed.find((e) => now >= e.start && now < e.end);
  if (current) return { state: "live", segment: current };

  const next = streamed.find((e) => e.start > now);
  if (next) {
    const minutesUntil = (next.start - now) / 60000;
    if (minutesUntil <= TWITCH_EMBED_MINUTES_BEFORE) {
      return { state: "soon", segment: next };
    }
    return { state: "offline", segment: next };
  }

  return { state: "offline", segment: null };
}

const STATUS_META = {
  live: { label: "En direct", color: "#EF4444", pulse: true },
  soon: { label: "Bientôt en direct", color: "#FFD700", pulse: true },
  offline: { label: "Hors ligne", color: "#6B7280", pulse: false },
};

function formatSegmentTime(segment) {
  if (!segment) return null;
  const dayLabel = { "2026-10-09": "Vendredi", "2026-10-10": "Samedi", "2026-10-11": "Dimanche" }[segment.date] || segment.date;
  return `${dayLabel} ${segment.startTime} – ${segment.endTime}`;
}

export default function LivePage() {
  const [events, setEvents] = useState([]);
  const [cagnotte, setCagnotte] = useState(null);
  const [now, setNow] = useState(new Date());

  const load = useCallback(() => {
    getEvents().then((r) => setEvents(r.data || [])).catch(() => {});
    getCagnotte().then((r) => setCagnotte(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const dataInterval = setInterval(load, 30000);
    const clock = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(clock);
    };
  }, [load]);

  const { state, segment } = computeStreamStatus(events, now);
  const meta = STATUS_META[state];
  // Cagnotte "native" (Ticket d'Or + dons Twitch) — le total incluant les dons
  // en ligne (Supabase/Stripe) vit sur /cagnotte, pas répété ici.
  const cagnotteTotal = cagnotte ? (cagnotte.twitchTotal || 0) + (cagnotte.ticketOrTotal || 0) : 0;
  const cagnotteGoal = 100000;
  const pct = cagnotte ? Math.min(100, (cagnotteTotal / cagnotteGoal) * 100) : 0;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-20 relative overflow-hidden"
    >
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <motion.div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full opacity-[0.06]"
          animate={{ opacity: [0.03, 0.09, 0.03] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ background: `radial-gradient(ellipse, ${meta.color}, transparent)` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center mb-10">
          <motion.p variants={fadeInUp} className="font-mono text-ember-600 text-xs tracking-[0.5em] uppercase mb-4">
            [ LAN Gaming 2026 · Diffusion ]
          </motion.p>
          <motion.h1 variants={fadeInUp} className="font-display text-5xl sm:text-6xl font-black uppercase text-white leading-none mb-4">
            Live
          </motion.h1>
        </motion.div>

        {/* Overlay "bientôt en ligne" — la diffusion démarre avec l'événement */}
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          animate="visible"
          className="border border-amber-400/25 bg-amber-400/5 p-5 md:p-6 mb-6 text-center relative overflow-hidden"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
        >
          <div className="absolute inset-0 bg-ember-glow opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <Bell size={20} className="text-amber-400 mx-auto mb-2" />
            <p className="font-display text-white font-bold text-sm md:text-base mb-1">
              Le live démarre bientôt
            </p>
            <p className="font-body text-zinc-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
              La diffusion Twitch sera active les 9, 10 et 11 octobre 2026, au rythme des compétitions et de la Grande finale du dimanche.
            </p>
          </div>
        </motion.div>

        {/* Status card */}
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          animate="visible"
          className="border bg-obsidian-800/80 p-6 md:p-8 mb-6"
          style={{
            borderColor: `${meta.color}40`,
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            boxShadow: `0 0 40px ${meta.color}1A`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: meta.color }}
              animate={meta.pulse ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="font-mono text-[11px] tracking-[0.4em] uppercase font-bold" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>

          {segment ? (
            <>
              <h2 className="font-display text-xl md:text-2xl font-black text-white mb-2">{segment.title}</h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="flex items-center gap-1.5 font-mono text-zinc-500 text-xs">
                  <Clock size={12} /> {formatSegmentTime(segment)}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-zinc-500 text-xs">
                  <MapPin size={12} /> {segment.location}
                </span>
              </div>
              <p className="font-body text-zinc-400 text-sm leading-relaxed">{segment.description}</p>
            </>
          ) : (
            <p className="font-body text-zinc-500 text-sm">
              Aucune diffusion prévue pour le moment — consulte le{" "}
              <Link to="/calendrier" className="text-ember-400 hover:text-ember-300 underline">
                programme complet
              </Link>{" "}
              pour les prochains segments.
            </p>
          )}

          <a
            href={TWITCH_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full flex items-center justify-center gap-2 py-4 font-display font-black text-sm tracking-widest uppercase text-white transition-transform hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #9146FF, #6441A5)",
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <Radio size={16} /> Ouvrir le stream sur Twitch <ExternalLink size={13} />
          </a>
        </motion.div>

        {/* Cagnotte snippet */}
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          animate="visible"
          className="border border-amber-500/20 bg-obsidian-800/60 p-6 mb-6"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-mono text-amber-500 text-[10px] tracking-[0.4em] uppercase">
              <Heart size={13} /> Cagnotte Fondation
            </span>
            {!cagnotte && <RefreshCw size={12} className="text-zinc-700 animate-spin" />}
          </div>
          {cagnotte && (
            <>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display font-black text-2xl text-amber-300">
                  {cagnotteTotal.toLocaleString("fr-CA")}$
                </span>
                <span className="font-mono text-zinc-600 text-xs">/ {cagnotteGoal.toLocaleString("fr-CA")}$</span>
              </div>
              <div className="h-2 bg-obsidian-700 overflow-hidden mb-4" style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C89B3C, #FFD700)" }} />
              </div>
            </>
          )}
          <Link
            to="/cagnotte"
            className="w-full flex items-center justify-center gap-2 py-3 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-display font-bold text-xs tracking-widest uppercase transition-colors"
          >
            Faire un don
          </Link>
        </motion.div>

        {/* Résultats */}
        <motion.div variants={scrollReveal} initial="hidden" animate="visible">
          <Link
            to="/competitions"
            className="flex items-center justify-between px-5 py-4 border border-zinc-800 bg-obsidian-800/60 hover:border-zinc-600 transition-colors group"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
          >
            <span className="flex items-center gap-2 font-body text-zinc-300 group-hover:text-white text-sm transition-colors">
              <Trophy size={14} className="text-ember-400" /> Voir les résultats des matchs
            </span>
            <ExternalLink size={13} className="text-zinc-600" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
