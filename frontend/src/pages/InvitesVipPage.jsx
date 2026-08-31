import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds } from '@react-three/drei';
import {
  Crown, Sparkles, ChevronRight, Star, Clock,
} from 'lucide-react';
import { pageTransition, scrollReveal } from '../utils/animations.js';
import WebGLErrorBoundary from '../components/layout/WebGLErrorBoundary.jsx';
import { SasCs2Model, RifleModel } from '../components/three/GameAssets.jsx';

// ── Programmation en développement ──────────────────────────────────────────
// Aucun artiste, créateur, studio ou entreprise discrète n'a encore confirmé
// sa présence publiquement par écrit (cahier de finalisation V1 §4 : aucune
// mention publique tant que l'annonce et les conditions ne sont pas
// sécurisées — notamment le logo Ubisoft, à ne pas afficher tant que leur
// souhait de discrétion demeure). Ne pas afficher de nom, logo ou bio ici
// tant qu'une confirmation écrite ET publique n'a pas été obtenue.
function ProgrammingInProgress() {
  return (
    <motion.div
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="border border-zinc-800 bg-obsidian-800/60 p-10 md:p-14 text-center"
      style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
    >
      <Clock size={28} className="text-ember-500 mx-auto mb-4" />
      <p className="font-mono text-ember-500 text-xs tracking-widest uppercase mb-3">
        Programmation en développement
      </p>
      <h3 className="font-display text-white text-xl md:text-2xl font-black mb-3">
        Les invités et créateurs seront annoncés ici dès leur confirmation
      </h3>
      <p className="font-body text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
        Des démarches sont en cours auprès de plusieurs créateurs de contenu québécois et
        artistes. Aucun nom ne sera publié avant confirmation écrite — suis nos réseaux
        sociaux et cette page pour les annonces officielles.
      </p>
    </motion.div>
  );
}

// ── Scène 3D — l'agent SAS CS2 dévoile son rifle ─────────────────────────────
function SasCs2ShowcaseScene() {
  const agentRef = useRef();
  const rifleRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (agentRef.current) {
      agentRef.current.position.y = Math.sin(t * 0.6) * 0.05;
      agentRef.current.rotation.y = -0.25 + Math.sin(t * 0.3) * 0.08;
    }
    if (rifleRef.current) {
      rifleRef.current.position.y = 0.15 + Math.sin(t * 0.8 + 1) * 0.06;
      rifleRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group>
      <group ref={agentRef} position={[-0.55, -0.3, 0]}>
        <SasCs2Model />
      </group>
      <group ref={rifleRef} position={[0.55, 0.35, 0.3]}>
        <RifleModel rotation={[0, 0, Math.PI / 2]} />
      </group>
    </group>
  );
}

function UltraCharacterTeaser() {
  return (
    <motion.div
      className="mt-10 grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-6 sm:gap-10 items-center border border-ember-400/20 bg-glass p-6 md:p-10 relative overflow-hidden"
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-32 h-px bg-gradient-to-r from-transparent via-ember-400 to-transparent" />

      <div className="text-center sm:text-left order-2 sm:order-1">
        <p className="font-mono text-ember-500 text-[10px] tracking-widest uppercase mb-3 flex items-center gap-2 justify-center sm:justify-start">
          <Sparkles size={12} /> [ Teaser exclusif VIP ]
        </p>
        <h3 className="font-display text-2xl md:text-4xl font-black uppercase text-white leading-tight">
          New Ultra <span className="text-ember-300 text-ember-glow">Characters</span> In Coming !
        </h3>
        <p className="font-body text-zinc-500 text-sm mt-4 max-w-md">
          De nouveaux agents ultra rares rejoignent bientôt la collection LAN 2026 — première image en exclusivité pour nos invités VIP.
        </p>
      </div>

      <div className="order-1 sm:order-2 w-full sm:w-64 h-64 sm:h-72 mx-auto flex-shrink-0">
        <WebGLErrorBoundary fallback={<div className="w-full h-full" />}>
          <Canvas camera={{ fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
            <ambientLight intensity={1.1} />
            <pointLight position={[2, 2, 2]} intensity={3.2} color="#C89B3C" />
            <pointLight position={[-2, 0, 1]} intensity={1.4} color="#4FC3F7" />
            <pointLight position={[0, 1, 2]} intensity={1.6} color="#FFFFFF" />
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.8}>
                <SasCs2ShowcaseScene />
              </Bounds>
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InvitesVipPage() {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen pb-24 relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <div className="absolute inset-0 opacity-[0.012]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(200,155,60,0.4) 50px, rgba(200,155,60,0.4) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(200,155,60,0.4) 50px, rgba(200,155,60,0.4) 51px)' }}
        />
        <div className="absolute inset-0 bg-ember-glow opacity-40" />
      </div>

      {/* Hero */}
      <div className="relative pt-32 md:pt-40 pb-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.p
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3 flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <Crown size={13} /> [ Invités d'honneur ]
          </motion.p>
          <motion.h1
            className="font-display text-5xl md:text-7xl font-black uppercase leading-none"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
          >
            <span className="text-white">Invités</span>{' '}
            <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}>
              VIP
            </span>
          </motion.h1>
          <motion.div
            className="flex items-center gap-4 mt-4 max-w-2xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          >
            <div className="h-px w-12 bg-ember-400 flex-shrink-0" />
            <p className="font-body text-zinc-500 text-sm">
              Des démarches sont en cours auprès de créateurs et d'artistes québécois.
            </p>
          </motion.div>

          <UltraCharacterTeaser />
        </div>
      </div>

      {/* Programmation en développement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProgrammingInProgress />
      </div>

      {/* CTA */}
      <motion.div
        className="max-w-lg mx-auto mt-24 px-4 text-center border border-ember-400/15 bg-obsidian-800/60 p-8"
        variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
        style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
      >
        <Star size={24} className="text-ember-400 mx-auto mb-3" />
        <p className="font-display text-white font-bold text-lg mb-2">Envie de vivre l'événement ?</p>
        <p className="font-body text-zinc-500 text-sm mb-5 leading-relaxed">
          Réserve ta place dès maintenant et suis nos annonces pour la programmation d'invités à venir.
        </p>
        <a
          href="/billetterie"
          className="inline-flex items-center gap-2 font-mono text-xs text-obsidian-900 bg-ember-400 hover:bg-ember-300 px-6 py-2.5 clip-diagonal font-bold tracking-widest uppercase transition-colors"
        >
          Obtenir mes billets <ChevronRight size={12} />
        </a>
      </motion.div>
    </motion.div>
  );
}
