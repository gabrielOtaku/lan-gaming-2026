import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import WebGLErrorBoundary from '../components/layout/WebGLErrorBoundary.jsx';
import { pageTransition } from '../utils/animations.js';
import Timeline from '../components/calendar/Timeline.jsx';
import MapOverlay from '../components/calendar/MapOverlay.jsx';

// ── Subtle background 3D ──────────────────────────────────────────────────────
function CalendarBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      <WebGLErrorBoundary>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 1]}>
          <ambientLight intensity={0.1} />
          <Suspense fallback={null}>
            <Stars radius={60} depth={20} count={800} factor={2} saturation={0} fade speed={0.3} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}

// ── Page hero header ───────────────────────────────────────────────────────────
function CalendarHero() {
  return (
    <div className="relative h-64 md:h-80 flex items-end overflow-hidden">
      <CalendarBackground />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900/60 via-obsidian-900/40 to-obsidian-900" />

      {/* Decorative rune grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200,155,60,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,155,60,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
        <motion.p
          className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          [ 9 – 11 Octobre 2026 ]
        </motion.p>

        <motion.h1
          className="font-display text-5xl md:text-7xl font-black text-white uppercase tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Calendrier &{' '}
          <span
            className="text-ember-glow"
            style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}
          >
            Arènes
          </span>
        </motion.h1>

        <motion.div
          className="flex items-center gap-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-px w-12 bg-ember-400" />
          <p className="font-body text-zinc-500 text-sm">
            Programme complet des événements et plans des salles
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Countdown banner ──────────────────────────────────────────────────────────
function CountdownBanner() {
  const eventDate = new Date('2026-10-09T17:00:00');
  const now = new Date();
  const diff = eventDate - now;

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  return (
    <motion.div
      className="bg-ember-600/10 border-y border-ember-400/15 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 md:gap-16">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="font-display font-black text-3xl md:text-4xl text-ember-300">{days}</p>
            <p className="font-mono text-zinc-600 text-[10px] tracking-widest uppercase">Jours</p>
          </div>
          <span className="font-display text-ember-500 text-2xl animate-pulse">:</span>
          <div className="text-center">
            <p className="font-display font-black text-3xl md:text-4xl text-ember-300">{hours.toString().padStart(2, '0')}</p>
            <p className="font-mono text-zinc-600 text-[10px] tracking-widest uppercase">Heures</p>
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-white text-sm md:text-base tracking-wide">Avant le début de la LAN</p>
          <p className="font-mono text-zinc-600 text-xs tracking-widest">CÉGEP DE SAINT-FÉLICIEN · 9 OCT 2026</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      <CalendarHero />
      <CountdownBanner />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Timeline section */}
        <Timeline />

        {/* Separator */}
        <div className="my-20 flex items-center gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ember-400/30 to-transparent" />
          <div className="w-8 h-8 clip-hex border border-ember-400/30 flex items-center justify-center">
            <span className="text-ember-400 text-xs">◆</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-ember-400/30 to-transparent" />
        </div>

        {/* Map / Venues section */}
        <MapOverlay />
      </div>
    </motion.div>
  );
}
