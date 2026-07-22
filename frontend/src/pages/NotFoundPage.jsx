import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations.js';

// Glitch text effect
function GlitchText({ text }) {
  return (
    <div className="relative inline-block select-none">
      <span
        className="relative font-display font-black text-[6rem] md:text-[10rem] leading-none text-white tracking-tighter"
        style={{ textShadow: '0 0 40px rgba(200,155,60,0.5)' }}
        aria-label={text}
      >
        {text}
        {/* Red glitch layer */}
        <motion.span
          className="absolute inset-0 text-red-500"
          style={{ clipPath: 'polygon(0 35%, 100% 35%, 100% 45%, 0 45%)', mixBlendMode: 'screen' }}
          animate={{ x: [-3, 3, -2, 0, 2, -1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.5, ease: 'steps(7)' }}
        >
          {text}
        </motion.span>
        {/* Cyan glitch layer */}
        <motion.span
          className="absolute inset-0 text-cyan-400"
          style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 68%, 0 68%)', mixBlendMode: 'screen' }}
          animate={{ x: [2, -4, 1, 0, -2, 3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.5, delay: 0.05, ease: 'steps(7)' }}
        >
          {text}
        </motion.span>
      </span>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
    >
      {/* Background grid */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(200,155,60,0.5) 40px, rgba(200,155,60,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(200,155,60,0.5) 40px, rgba(200,155,60,0.5) 41px)',
          }}
        />
      </div>

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)' }}
      />

      {/* Pulsing glow behind 404 */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,155,60,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 404 glitch */}
      <GlitchText text="404" />

      {/* Sub-labels */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-2 mb-8"
      >
        <p className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3">
          [ Signal perdu ]
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
          Cette zone n'existe pas
        </h1>
        <p className="font-body text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
          La page que tu cherches n'est plus là, n'a jamais existé, ou a été déconnectée du serveur.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <Link
          to="/"
          className="group relative overflow-hidden px-8 py-3 font-display font-bold text-sm tracking-widest uppercase text-obsidian-900"
          style={{
            background: 'linear-gradient(135deg, #C89B3C, #FFD700)',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative z-10">Retour à l'accueil</span>
        </Link>
        <Link
          to="/billetterie"
          className="px-8 py-3 border border-ember-400/40 text-ember-300 hover:border-ember-400/80 hover:bg-ember-400/10 font-mono text-sm tracking-widest uppercase transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
        >
          Billetterie
        </Link>
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 font-mono text-zinc-800 text-[10px] tracking-widest"
      >
        LAN Gaming 2026 · Cégep de Saint-Félicien · 9-11 oct. 2026
      </motion.p>
    </motion.div>
  );
}
