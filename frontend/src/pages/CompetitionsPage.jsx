import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { Swords, Users, Gamepad2, Sparkles, ChevronRight } from 'lucide-react';
import { pageTransition, fadeInUp, staggerContainer, scrollReveal } from '../utils/animations.js';
import WebGLErrorBoundary from '../components/layout/WebGLErrorBoundary.jsx';
import { DominusModel, OctaneModel } from '../components/three/GameAssets.jsx';

// ── Vitrine V1 ────────────────────────────────────────────────────────────────
// Cahier de finalisation V1 §5 : seuls les 3 tournois officiels sont exposés
// publiquement, sans bracket, sans inscription en ligne et sans moteur de
// tournoi temps réel — ces éléments reviendront une fois les inscriptions
// réellement collectées (voir /admin, qui garde le moteur de bracket complet
// pour la préparation interne).

const TOURNAMENTS = [
  {
    id: 'lol',
    name: 'League of Legends',
    short: 'LoL',
    icon: '⚔️',
    color: '#C89B3C',
    format: '5v5',
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    short: 'CS2',
    icon: '🔫',
    color: '#FF4655',
    format: '5v5',
  },
  {
    id: 'rocket_league',
    name: 'Rocket League',
    short: 'Rocket League',
    icon: '🚀',
    color: '#4FC3F7',
    format: '3v3',
  },
];

const ANIMATIONS = [
  'Consoles',
  'Arcade',
  'Jeux UQAC',
  'Jeux indépendants',
  'Défis communautaires',
  'Autres activités confirmées',
];

// ── Scène 3D — Dominus contre Octane, duel dans l'arène ──────────────────────
function ArenaBattleScene() {
  const dominusRef = useRef();
  const octaneRef = useRef();
  const sparkRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dominusRef.current) {
      dominusRef.current.position.y = -0.15 + Math.sin(t * 1.1) * 0.05;
      dominusRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
      dominusRef.current.rotation.x = Math.sin(t * 1.3) * 0.02;
    }
    if (octaneRef.current) {
      octaneRef.current.position.y = -0.15 + Math.sin(t * 1.1 + Math.PI) * 0.05;
      octaneRef.current.rotation.z = Math.sin(t * 0.8 + Math.PI) * 0.04;
      octaneRef.current.rotation.x = Math.sin(t * 1.3 + Math.PI) * 0.02;
    }
    if (sparkRef.current) {
      const pulse = 0.6 + Math.sin(t * 4) * 0.4;
      sparkRef.current.scale.setScalar(0.5 + pulse * 0.3);
      sparkRef.current.material.opacity = 0.35 + pulse * 0.4;
    }
  });

  return (
    <group>
      <group ref={dominusRef} position={[-1.1, -0.15, 0]} rotation={[0, Math.PI / 2 + 0.3, 0]}>
        <DominusModel />
      </group>
      <group ref={octaneRef} position={[1.1, -0.15, 0]} rotation={[0, -Math.PI / 2 - 0.3, 0]}>
        <OctaneModel />
      </group>
      <mesh ref={sparkRef} position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CompetitionsHero3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <WebGLErrorBoundary>
        <Canvas camera={{ fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
          <ambientLight intensity={1.3} />
          <pointLight position={[3, 2, 3]} intensity={3.4} color="#C89B3C" />
          <pointLight position={[-3, 1, 2]} intensity={2.4} color="#FF4655" />
          <pointLight position={[0, 2, -1]} intensity={1.6} color="#4FC3F7" />
          <pointLight position={[0, 1.5, 3]} intensity={1.8} color="#FFFFFF" />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.2}>
              <ArenaBattleScene />
            </Bounds>
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}

// ── Carte tournoi officiel ─────────────────────────────────────────────────────
function TournamentCard({ t, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="relative p-6 border overflow-hidden"
      style={{
        borderColor: `${t.color}30`,
        background: `${t.color}08`,
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${t.color}90, transparent)` }} />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{t.icon}</span>
        <div>
          <p className="font-display font-black text-white text-lg leading-tight">{t.name}</p>
          <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: t.color }}>
            Tournoi officiel
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Users size={12} style={{ color: t.color }} />
        <span className="font-mono text-zinc-400 text-xs tracking-wide">Format d'équipe : {t.format}</span>
      </div>

      <div className="space-y-2 border-t pt-4" style={{ borderColor: `${t.color}20` }}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-zinc-600 text-[10px] tracking-widest uppercase">Règlement</span>
          <span className="font-body text-zinc-400 text-xs italic">À venir</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-zinc-600 text-[10px] tracking-widest uppercase">Récompenses</span>
          <span className="font-body text-zinc-400 text-xs italic">À annoncer</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CompetitionsPage() {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-16 pb-24">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <div className="absolute inset-0 opacity-[0.022]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 48px,rgba(200,155,60,1) 48px,rgba(200,155,60,1) 49px),repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(200,155,60,1) 48px,rgba(200,155,60,1) 49px)',
        }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(200,155,60,0.4),transparent)' }} />
      </div>

      {/* Hero 3D — Dominus vs Octane */}
      <div className="relative h-72 md:h-96 flex items-end overflow-hidden mb-14">
        <CompetitionsHero3D />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900/40 via-transparent to-obsidian-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-8">
          <motion.p
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            [ Arène des tournois ]
          </motion.p>
          <motion.h1
            className="font-display text-5xl md:text-7xl font-black uppercase leading-none"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
          >
            <span className="text-white">Entrez dans</span>{' '}
            <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}>
              l'arène
            </span>
          </motion.h1>
          <motion.p
            className="font-body text-zinc-500 text-sm max-w-lg mt-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          >
            Trois tournois officiels au programme du Cégep en LAN 2026. Équipes, règlement et récompenses seront annoncés à l'ouverture des inscriptions.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Tournois officiels */}
        <div className="mb-8 flex items-center gap-3">
          <Swords size={14} className="text-ember-500" />
          <p className="font-mono text-ember-500 text-xs tracking-[0.4em] uppercase">Tournois officiels</p>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          {TOURNAMENTS.map((t, i) => <TournamentCard key={t.id} t={t} index={i} />)}
        </motion.div>

        {/* CTA billetterie */}
        <motion.div
          className="text-center mt-10"
          variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <a
            href="/billetterie"
            className="inline-flex items-center gap-2 font-mono text-xs text-obsidian-900 bg-ember-400 hover:bg-ember-300 px-6 py-3 clip-diagonal font-bold tracking-widest uppercase transition-colors"
          >
            Billetterie / inscriptions bientôt disponibles <ChevronRight size={12} />
          </a>
        </motion.div>

        {/* Jeux & animations */}
        <div className="mt-24">
          <div className="mb-8 flex items-center gap-3">
            <Gamepad2 size={14} className="text-rune-blue" />
            <p className="font-mono text-rune-blue text-xs tracking-[0.4em] uppercase">Jeux &amp; animations</p>
          </div>
          <motion.p
            className="font-body text-zinc-500 text-sm max-w-xl mb-6"
            variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            En dehors des tournois officiels, l'événement propose aussi des activités libres et non compétitives,
            accessibles à tous les billets.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-3"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {ANIMATIONS.map((a) => (
              <motion.span
                key={a}
                variants={fadeInUp}
                className="flex items-center gap-2 px-4 py-2 border border-rune-blue/20 bg-rune-blue/5 font-body text-zinc-300 text-sm"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                <Sparkles size={11} className="text-rune-blue/70" /> {a}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
