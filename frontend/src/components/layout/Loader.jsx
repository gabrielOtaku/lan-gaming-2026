import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loaderExit, loaderBar, EASE_DRAMATIC, EASE_GAME } from '../../utils/animations.js';

const LOADING_STEPS = [
  'Initialisation des systèmes...',
  'Chargement des arènes...',
  'Calibration des armes...',
  'Connexion aux serveurs...',
  'Prêt au combat.',
];

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const totalDuration = 2800;
    const interval = 30;
    const steps = totalDuration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const newProgress = Math.min((current / steps) * 100, 100);
      setProgress(newProgress);
      setStepIndex(Math.floor((newProgress / 100) * (LOADING_STEPS.length - 1)));

      if (newProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 600);
        }, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-obsidian-900 overflow-hidden"
          variants={loaderExit}
          initial="initial"
          exit="exit"
        >
          {/* Background atmosphere */}
          <div className="absolute inset-0 bg-ember-glow opacity-30" />

          {/* Dramatic corner decorations */}
          <CornerRunes />

          {/* Horizontal scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember-300 to-transparent opacity-40"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Central emblem */}
          <motion.div
            className="relative mb-12"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE_DRAMATIC }}
          >
            <EmberEmblem />
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: EASE_GAME }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-widest text-ember-300 text-ember-glow uppercase">
              LAN Gaming
            </h1>
            <motion.span
              className="font-mono text-ember-200 text-xl tracking-[0.5em] block"
              animate={{
                opacity: [0.5, 1, 0.5],
                textShadow: [
                  '0 0 5px rgba(200,155,60,0.3)',
                  '0 0 20px rgba(255,215,0,0.8)',
                  '0 0 5px rgba(200,155,60,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              2026
            </motion.span>
          </motion.div>

          <motion.p
            className="font-body text-obsidian-500 text-sm tracking-widest uppercase mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.9 }}
          >
            Cégep de Saint-Félicien
          </motion.p>

          {/* Progress bar container */}
          <motion.div
            className="w-64 md:w-96"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {/* Status text */}
            <div className="h-6 mb-3 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  className="font-mono text-ember-400 text-xs tracking-widest text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {LOADING_STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress track */}
            <div className="relative h-1 bg-obsidian-600 overflow-hidden">
              {/* Track decorative ends */}
              <div className="absolute left-0 top-0 w-2 h-full bg-ember-400 opacity-60" />
              <div className="absolute right-0 top-0 w-2 h-full bg-ember-400 opacity-60" />

              {/* Fill */}
              <motion.div
                className="absolute top-0 left-0 h-full origin-left"
                style={{
                  background: 'linear-gradient(90deg, #C89B3C, #FFD700, #C89B3C)',
                  backgroundSize: '200% 100%',
                  width: `${progress}%`,
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />

              {/* Glow pulse at leading edge */}
              <motion.div
                className="absolute top-0 h-full w-4 blur-sm bg-ember-200 opacity-80"
                style={{ left: `${Math.max(0, progress - 2)}%` }}
              />
            </div>

            {/* Percentage */}
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono text-ember-500 text-xs">SYS_BOOT</span>
              <motion.span
                className="font-mono text-ember-300 text-xs"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {Math.floor(progress)}%
              </motion.span>
            </div>
          </motion.div>

          {/* Ember particles */}
          <EmberParticles />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmberEmblem() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-ember-400 opacity-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute w-2 h-2 bg-ember-300 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateY(-62px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </motion.div>

      {/* Inner rotating ring (opposite direction) */}
      <motion.div
        className="absolute inset-4 rounded-full border border-ember-300 opacity-30"
        animate={{ rotate: -360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Center hexagon */}
      <motion.div
        className="w-16 h-16 clip-hex bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 15px rgba(200,155,60,0.4)',
            '0 0 40px rgba(255,215,0,0.8)',
            '0 0 15px rgba(200,155,60,0.4)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="font-rune text-obsidian-900 text-lg font-bold">LG</span>
      </motion.div>
    </div>
  );
}

function CornerRunes() {
  const corners = [
    { position: 'top-0 left-0', border: 'border-t-2 border-l-2' },
    { position: 'top-0 right-0', border: 'border-t-2 border-r-2' },
    { position: 'bottom-0 left-0', border: 'border-b-2 border-l-2' },
    { position: 'bottom-0 right-0', border: 'border-b-2 border-r-2' },
  ];

  return (
    <>
      {corners.map(({ position, border }, i) => (
        <motion.div
          key={i}
          className={`absolute ${position} w-16 h-16 ${border} border-ember-400 opacity-50`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        />
      ))}
    </>
  );
}

function EmberParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-ember-300"
          style={{
            left: `${10 + (i * 7.5)}%`,
            bottom: '10%',
          }}
          animate={{
            y: [0, -(150 + Math.random() * 200)],
            x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60],
            opacity: [0, 0.8, 0],
            scale: [0, 1 + Math.random(), 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
