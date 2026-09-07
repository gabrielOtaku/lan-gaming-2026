import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollReveal, EASE_GAME } from '../../utils/animations.js';

// Descriptions volontairement générales — pas de plan de salle détaillé ni de
// chiffre de capacité/postes tant que ces informations ne sont pas confirmées
// (même principe que NEXUS_CONTEXT côté backend : ne jamais inventer de chiffre).
const VENUES = [
  {
    id: 'place-centrale',
    name: 'Place centrale',
    floors: ['Niveau 1', 'Niveau 2'],
    description: 'Le cœur de l\'événement. Niveau 1 : le grind principal, où les participants installent leurs postes et disputent leurs matchs de qualification. Niveau 2 : l\'espace visiteur, ouvert au public.',
    color: '#C89B3C',
    icon: '🏛️',
    activities: ['Grind principal (Niv. 1)', 'Espace visiteur (Niv. 2)'],
    floorPlans: {
      'Niveau 1': {
        zones: [
          { id: 'grind', label: 'Grind principal', x: 5, y: 5, w: 90, h: 90, color: '#C89B3C' },
        ],
      },
      'Niveau 2': {
        zones: [
          { id: 'visiteurs', label: 'Espace visiteur', x: 5, y: 5, w: 90, h: 90, color: '#4FC3F7' },
        ],
      },
    },
  },
  {
    id: 'azimut',
    name: 'Salle Azimut',
    floors: ['Rez-de-chaussée'],
    description: 'La salle des compétitions. Cérémonies, programmation artistique, quarts/demi-finales et grandes finales de LoL, CS2 et Rocket League, diffusées en direct sur Twitch.',
    color: '#C89B3C',
    icon: '⚔️',
    activities: ['Cérémonies', 'Compétitions diffusées', 'Festival des finales'],
    floorPlans: {
      'Rez-de-chaussée': {
        zones: [
          { id: 'competitions', label: 'Compétitions', x: 5, y: 5, w: 90, h: 90, color: '#FFD700' },
        ],
      },
    },
  },
  {
    id: 'gymnase',
    name: 'Gymnase',
    floors: ['Rez-de-chaussée'],
    description: 'La salle de repos. Pauses repas et moments de détente pour les participants entre les blocs de compétition.',
    color: '#00D4AA',
    icon: '🛌',
    activities: ['Pauses repas', 'Détente'],
    floorPlans: {
      'Rez-de-chaussée': {
        zones: [
          { id: 'repos', label: 'Salle de repos', x: 5, y: 5, w: 90, h: 90, color: '#00D4AA' },
        ],
      },
    },
  },
];

// ── Floor plan SVG ────────────────────────────────────────────────────────────
function FloorPlan({ zones, color }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-full h-auto" style={{ maxHeight: '240px' }}>
        {/* Background grid */}
        <defs>
          <pattern id="smallGrid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(200,155,60,0.06)" strokeWidth="0.3"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`rgba(7,9,15,0.8)`} />
        <rect width="100" height="100" fill="url(#smallGrid)" />

        {/* Outer wall */}
        <rect x="2" y="2" width="96" height="96" fill="none" stroke={`${color}30`} strokeWidth="0.8" rx="1"/>

        {zones.map((zone) => (
          <g key={zone.id}>
            <motion.rect
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              fill={hovered === zone.id ? `${zone.color}25` : `${zone.color}12`}
              stroke={zone.color}
              strokeWidth={hovered === zone.id ? '0.8' : '0.4'}
              strokeOpacity={hovered === zone.id ? 1 : 0.5}
              rx="0.5"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(zone.id)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
            <text
              x={zone.x + zone.w / 2}
              y={zone.y + zone.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={hovered === zone.id ? '#FFD700' : `${zone.color}cc`}
              fontSize="3.5"
              fontFamily="'Share Tech Mono', monospace"
              style={{ pointerEvents: 'none' }}
            >
              {zone.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Venue card ────────────────────────────────────────────────────────────────
function VenueCard({ venue, isSelected, onClick }) {
  return (
    <motion.button
      className={`w-full text-left p-4 border transition-all duration-200 relative ${
        isSelected ? 'bg-glass border-ember-400/50' : 'bg-obsidian-800 border-zinc-800 hover:border-zinc-700'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      style={{ borderColor: isSelected ? `${venue.color}50` : undefined }}
    >
      {isSelected && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ background: venue.color }}
          layoutId="activeBar"
        />
      )}

      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{venue.icon}</span>
        <div>
          <h4 className={`font-display font-bold text-sm tracking-wide ${isSelected ? 'text-ember-200' : 'text-zinc-300'}`}>
            {venue.name}
          </h4>
          <p className="font-mono text-zinc-700 text-[10px] tracking-widest">
            {venue.floors.join(' · ')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {venue.activities.slice(0, 2).map((act) => (
          <span key={act} className="font-mono text-[9px] px-1.5 py-0.5 bg-obsidian-700 text-zinc-600 tracking-wide">
            {act}
          </span>
        ))}
        {venue.activities.length > 2 && (
          <span className="font-mono text-[9px] px-1.5 py-0.5 text-zinc-700">
            +{venue.activities.length - 2}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function MapOverlay() {
  const [selectedVenue, setSelectedVenue] = useState(VENUES[0]);
  const [selectedFloor, setSelectedFloor] = useState(VENUES[0].floors[0]);

  const handleVenueChange = (venue) => {
    setSelectedVenue(venue);
    setSelectedFloor(venue.floors[0]);
  };

  const currentPlan = selectedVenue.floorPlans[selectedFloor];

  return (
    <section className="mt-20 relative">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.p
          className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          [ Plans des arènes ]
        </motion.p>
        <motion.h2
          className="font-display text-3xl md:text-5xl font-black text-white uppercase tracking-tight"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Les <span className="text-ember-300 text-ember-glow">Arènes</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Venue selector */}
        <div className="flex flex-col gap-3">
          <p className="font-mono text-zinc-700 text-xs tracking-widest uppercase mb-2">Sélectionner</p>
          {VENUES.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isSelected={selectedVenue.id === venue.id}
              onClick={() => handleVenueChange(venue)}
            />
          ))}
        </div>

        {/* Right — Venue detail + floor plan */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVenue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: EASE_GAME }}
              className="border bg-glass p-6 md:p-8 h-full"
              style={{ borderColor: `${selectedVenue.color}25` }}
            >
              {/* Venue header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{selectedVenue.icon}</span>
                    <h3 className="font-display text-2xl font-black text-white tracking-wide">
                      {selectedVenue.name}
                    </h3>
                  </div>
                  <p className="font-body text-zinc-500 text-sm leading-relaxed">
                    {selectedVenue.description}
                  </p>
                </div>
              </div>

              {/* Floor selector */}
              {selectedVenue.floors.length > 1 && (
                <div className="flex gap-2 mb-4">
                  {selectedVenue.floors.map((floor) => (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`font-mono text-xs px-3 py-1 border transition-colors ${
                        selectedFloor === floor
                          ? 'border-ember-400/50 bg-ember-400/10 text-ember-300'
                          : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              )}

              {/* Floor plan */}
              <div className="border border-ember-400/10 p-4 bg-obsidian-900">
                <p className="font-mono text-zinc-700 text-[10px] tracking-widest uppercase mb-3">
                  Plan — {selectedFloor}
                </p>
                {currentPlan && (
                  <FloorPlan zones={currentPlan.zones} color={selectedVenue.color} />
                )}
              </div>

              {/* Activities */}
              <div className="mt-4">
                <p className="font-mono text-zinc-700 text-[10px] tracking-widest uppercase mb-2">Activités</p>
                <div className="flex flex-wrap gap-2">
                  {selectedVenue.activities.map((act) => (
                    <span
                      key={act}
                      className="font-mono text-xs px-2 py-1 border text-ember-400"
                      style={{ borderColor: `${selectedVenue.color}30`, background: `${selectedVenue.color}08` }}
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
