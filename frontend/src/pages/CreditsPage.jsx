import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { pageTransition, staggerContainer, fadeInUp, scrollReveal } from '../utils/animations.js';

const MODELS = [
  {
    name: 'Esquie',
    author: 'Yennesis',
    authorUrl: 'https://sketchfab.com/sdarksoul99',
    sourceUrl: 'https://sketchfab.com/3d-models/esquie-a9c9793baa8a465488d0cb61c9b60bed',
    license: 'CC-BY-4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    note: null,
  },
  {
    name: 'Maelle from Clair Obscur Expedition 33',
    author: 'Théo Domon',
    authorUrl: 'https://sketchfab.com/Gloomeskk',
    sourceUrl: 'https://sketchfab.com/3d-models/maelle-from-clair-obscur-expedition-33-9a76982f86e6498aa5bfd0603909f84f',
    license: 'CC-BY-NC-4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by-nc/4.0/',
    note: 'Usage non commercial',
  },
  {
    name: 'Dominus — Rocket League Car',
    author: 'Jako',
    authorUrl: 'https://sketchfab.com/fairlight51',
    sourceUrl: 'https://sketchfab.com/3d-models/dominus-rocket-league-car-f592f249a65f41cd81a0e5aa3d418cb2',
    license: 'CC-BY-4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    note: null,
  },
  {
    name: 'Octane | Rocket League',
    author: 'Víctor Hernández',
    authorUrl: 'https://sketchfab.com/victorhugohc',
    sourceUrl: 'https://sketchfab.com/3d-models/octane-rocket-league-8c1bec6e9c1448a58a5007b1f21c8d21',
    license: 'CC-BY-4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    note: null,
  },
  {
    name: 'RIFLE | AWP Weapon Model (CS2)',
    author: '6lucius',
    authorUrl: 'https://sketchfab.com/6lucius',
    sourceUrl: 'https://sketchfab.com/3d-models/rifle-awp-weapon-model-cs2-23ad3d7fb46b40e59cab7937654e2691',
    license: 'CC-BY-4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    note: null,
  },
  {
    name: 'SAS | CS2 Agent Model Blue',
    author: '6lucius',
    authorUrl: 'https://sketchfab.com/6lucius',
    sourceUrl: 'https://sketchfab.com/3d-models/sas-cs2-agent-model-blue-7f18aaccd0ee4694a36646101a12339e',
    license: 'CC-BY-4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    note: null,
  },
];

function ModelCard({ model, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="border border-zinc-800 bg-obsidian-800/60 p-5 hover:border-ember-400/30 transition-colors duration-300"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display text-white text-base font-bold leading-snug">{model.name}</h3>
        <span
          className={`flex-shrink-0 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border ${
            model.note
              ? 'text-red-400 border-red-500/30 bg-red-500/10'
              : 'text-ember-400 border-ember-400/30 bg-ember-400/10'
          }`}
        >
          {model.license}
        </span>
      </div>

      <p className="font-body text-zinc-500 text-sm">
        Par{' '}
        <a href={model.authorUrl} target="_blank" rel="noopener noreferrer" className="text-ember-300 hover:text-ember-200 transition-colors inline-flex items-center gap-1">
          {model.author} <ExternalLink size={11} />
        </a>
        , via{' '}
        <a href={model.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ember-300 hover:text-ember-200 transition-colors inline-flex items-center gap-1">
          Sketchfab <ExternalLink size={11} />
        </a>
      </p>

      {model.note && (
        <p className="font-mono text-red-400/80 text-[11px] mt-3 pt-3 border-t border-red-900/30">
          {model.note} — licence{' '}
          <a href={model.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-red-300">
            {model.license}
          </a>
        </p>
      )}
    </motion.div>
  );
}

export default function CreditsPage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-32 md:pt-40 pb-24 px-4 sm:px-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.p
          className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          [ Attribution ]
        </motion.p>
        <motion.h1
          className="font-display text-5xl md:text-6xl font-black uppercase leading-none mb-4"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
        >
          <span className="text-white">Crédits</span>
        </motion.h1>
        <motion.p
          className="font-body text-zinc-500 text-sm max-w-xl mb-14"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          Les personnages et véhicules 3D de LAN Gaming 2026 sont l'œuvre de créateurs indépendants
          publiée sur Sketchfab. Voici leurs crédits, comme l'exigent leurs licences.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {MODELS.map((model, i) => (
            <ModelCard key={model.name} model={model} index={i} />
          ))}
        </motion.div>

        <motion.p
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="font-mono text-zinc-700 text-[11px] tracking-wide mt-10 leading-relaxed"
        >
          Licences complètes : <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-ember-500 hover:text-ember-400 underline">CC-BY-4.0</a>
          {' · '}
          <a href="http://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-ember-500 hover:text-ember-400 underline">CC-BY-NC-4.0</a>
        </motion.p>
      </div>
    </motion.div>
  );
}
