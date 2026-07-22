import React, { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Star, ArrowRight, X, ChevronLeft, ChevronRight, ImageIcon, Gamepad2 } from 'lucide-react';
import { scrollReveal, scrollRevealLeft, scrollRevealRight, EASE_GAME } from '../../utils/animations.js';

import fondationLogo from '../../assets/Fondation/Logo_fondationwebp.webp';
import dgImg from '../../assets/Fondation/DG.jpg';
import partenaireImg from '../../assets/Fondation/Partenaire_Fondation.jpg';
import donationImg from '../../assets/Fondation/Donnation.jfif';
import discoursLvImg from '../../assets/Fondation/DiscoursLV.jpg';
import soireeLvImg from '../../assets/Fondation/SoireeLacVegas.png';
import chibougamauImg from '../../assets/Fondation/FondationChibougameau.png';
import tourismeImg from '../../assets/Fondation/TechniqueTourismeEvent.png';
import edition2023Img from '../../assets/Eddition/CegepEnLan2023.png';

const FOUNDATION_GALLERY = [
  {
    id: 1, src: tourismeImg, thumb: tourismeImg, type: 'charity',
    caption: "Soirée Lac Vegas — entièrement organisée par les étudiants de 3ᵉ année en Techniques de tourisme, accompagnés de leur professeur, avec l'appui de la Fondation.",
  },
  {
    id: 2, src: soireeLvImg, thumb: soireeLvImg, type: 'charity',
    caption: "Soirée Lac Vegas — une soirée immersive qui a accueilli de nombreux entrepreneurs de la région.",
  },
  {
    id: 3, src: discoursLvImg, thumb: discoursLvImg, type: 'charity',
    caption: "Discours de la directrice générale de la Fondation lors de la soirée Lac Vegas.",
  },
  {
    id: 4, src: dgImg, thumb: dgImg, type: 'charity',
    caption: "La directrice générale de la Fondation du Cégep de Saint-Félicien.",
  },
  {
    id: 5, src: partenaireImg, thumb: partenaireImg, type: 'charity',
    caption: "Rencontre avec l'un de nos précieux partenaires financiers.",
  },
  {
    id: 6, src: chibougamauImg, thumb: chibougamauImg, type: 'charity',
    caption: "La Fondation, active auprès des campus de Saint-Félicien et de Chibougamau.",
  },
  {
    id: 7, src: donationImg, thumb: donationImg, type: 'charity',
    caption: "Remise d'un don à la Fondation du Cégep de Saint-Félicien.",
  },
  {
    id: 8, src: edition2023Img, thumb: edition2023Img, type: 'gaming',
    caption: "Aperçu de Cégep en LAN 2023 — organisé par quatre anciens étudiants en Techniques de l'informatique.",
  },
];

const FOUNDATION_STATS = [
  { value: '20+', label: 'Ans d\'engagement', color: '#FFD700' },
  { value: '500K$', label: 'Bourses versées', color: '#C89B3C' },
  { value: '300+', label: 'Étudiants aidés', color: '#9A6E00' },
];

const FOUNDATION_MISSIONS = [
  'Soutien financier aux étudiants dans le besoin',
  'Attribution de bourses d\'excellence et de persévérance',
  'Financement de projets étudiants innovants',
  'Développement de l\'expérience académique et parascolaire',
];

// ── Animated heart ────────────────────────────────────────────────────────────
function PulsingHeart() {
  return (
    <motion.div
      className="relative flex items-center justify-center w-24 h-24"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-ember-400/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.5 + i * 0.3], opacity: [0.6, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
          style={{ width: '100%', height: '100%' }}
        />
      ))}

      {/* Icon */}
      <div className="relative w-24 h-24 clip-hex bg-gradient-to-br from-blood-mid to-blood-dark border border-red-900/40 flex items-center justify-center">
        <Heart size={36} className="text-red-400 fill-red-400" />
      </div>
    </motion.div>
  );
}

// ── Mission item ──────────────────────────────────────────────────────────────
function MissionItem({ text, index }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  return (
    <motion.li
      ref={ref}
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: EASE_GAME }}
    >
      <motion.span
        className="flex-shrink-0 mt-1"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8 + index, repeat: Infinity, ease: 'linear' }}
      >
        <Star size={12} className="text-ember-400 fill-ember-400/30" />
      </motion.span>
      <span className="font-body text-zinc-400 text-sm leading-relaxed">{text}</span>
    </motion.li>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, color, index }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="text-center p-5 border border-ember-400/10 bg-glass relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6, ease: EASE_GAME }}
      whileHover={{ borderColor: `${color}50` }}
    >
      <motion.p
        className="font-display text-3xl font-black"
        style={{ color }}
        animate={inView ? { textShadow: [`0 0 0px ${color}00`, `0 0 20px ${color}60`, `0 0 10px ${color}30`] } : {}}
        transition={{ delay: index * 0.15 + 0.3, duration: 1 }}
      >
        {value}
      </motion.p>
      <p className="font-mono text-zinc-600 text-xs tracking-widest mt-2 uppercase">{label}</p>
    </motion.div>
  );
}

// ── Photo lightbox ────────────────────────────────────────────────────────────
function Lightbox({ photos, activeIndex, onClose, onPrev, onNext }) {
  const photo = photos[activeIndex];
  if (!photo) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-obsidian-900/95 backdrop-blur-xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-3xl w-full"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE_GAME }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-ember-400/50 z-10" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-ember-400/50 z-10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-ember-400/50 z-10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-ember-400/50 z-10" />

        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.src}
            alt={photo.caption}
            className="w-full aspect-video object-cover"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Caption */}
        <div className="bg-obsidian-800 border border-ember-400/10 px-5 py-3 flex items-center justify-between">
          <p className="font-body text-zinc-400 text-sm">{photo.caption}</p>
          <span className="font-mono text-zinc-700 text-xs">{activeIndex + 1} / {photos.length}</span>
        </div>

        {/* Controls */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-zinc-500 hover:text-white transition-colors p-2"
        >
          <X size={24} />
        </button>
        <button
          onClick={onPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-obsidian-900/80 border border-zinc-800 hover:border-ember-400/50 flex items-center justify-center text-zinc-400 hover:text-ember-300 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-obsidian-900/80 border border-zinc-800 hover:border-ember-400/50 flex items-center justify-center text-zinc-400 hover:text-ember-300 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Foundation gallery grid ────────────────────────────────────────────────────
function FoundationGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex((i) => (i - 1 + FOUNDATION_GALLERY.length) % FOUNDATION_GALLERY.length);
  const nextPhoto = () => setLightboxIndex((i) => (i + 1) % FOUNDATION_GALLERY.length);

  return (
    <div className="mt-20">
      {/* Section header */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        variants={scrollReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
        <div className="flex items-center gap-2">
          <ImageIcon size={14} className="text-red-400/60" />
          <span className="font-mono text-red-400/60 text-[10px] tracking-[0.4em] uppercase">Galerie Photos</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-900/40 to-transparent" />
      </motion.div>

      {/* Photo grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        {FOUNDATION_GALLERY.map((photo, i) => {
          const isGaming = photo.type === 'gaming';
          return (
            <motion.button
              key={photo.id}
              onClick={() => openLightbox(i)}
              className={`relative group overflow-hidden aspect-video bg-obsidian-700 border transition-colors duration-300 ${
                isGaming ? 'border-rune-blue/20 hover:border-rune-blue/50' : 'border-ember-400/10 hover:border-red-900/40'
              }`}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_GAME } } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={photo.thumb}
                alt={photo.caption}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />

              {isGaming ? (
                <>
                  {/* Gaming overlay — scanlines + HUD corners */}
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(79,195,247,0.5) 3px, rgba(79,195,247,0.5) 4px)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/85 via-rune-blue/10 to-transparent group-hover:from-obsidian-900/50 transition-colors duration-300" />
                  {[['top-1.5 left-1.5', 'border-t border-l'], ['top-1.5 right-1.5', 'border-t border-r'], ['bottom-1.5 left-1.5', 'border-b border-l'], ['bottom-1.5 right-1.5', 'border-b border-r']].map(([pos, brd]) => (
                    <span key={pos} className={`absolute ${pos} w-3 h-3 ${brd} border-rune-blue/70`} />
                  ))}
                  <div className="absolute top-2 left-4 px-1.5 py-0.5 bg-obsidian-900/80 border border-rune-blue/40">
                    <span className="font-mono text-rune-blue text-[8px] tracking-widest">// ÉDITION 2023</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Charity overlay — warm vignette + heart badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blood-dark/70 via-obsidian-900/40 to-transparent group-hover:from-blood-dark/30 group-hover:via-obsidian-900/10 transition-colors duration-300" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 40px rgba(139,0,0,0.35)' }} />
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-blood-mid/70 border border-red-400/40 flex items-center justify-center">
                    <Heart size={9} className="text-red-300 fill-red-300" />
                  </div>
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-body text-white text-xs leading-tight text-left">{photo.caption}</p>
              </div>

              <div className={`absolute top-2 right-2 w-6 h-6 clip-hex flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                isGaming ? 'bg-rune-blue/20 border border-rune-blue/40' : 'bg-ember-400/20 border border-ember-400/30'
              }`}>
                {isGaming
                  ? <Gamepad2 size={10} className="text-rune-blue" />
                  : <span className="text-ember-300 text-[8px]">⊕</span>}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={FOUNDATION_GALLERY}
            activeIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function FoundationBlock() {
  const ref = useRef();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section ref={ref} id="fondation" className="relative py-24 md:py-40 overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900 via-blood-dark/20 to-obsidian-900" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(139,0,0,0.4) 0%, transparent 70%)' }}
        />
      </motion.div>

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
        <div className="flex justify-center -mt-3">
          <div className="px-6 py-1 bg-obsidian-900 border border-red-900/30">
            <span className="font-mono text-red-900/60 text-[10px] tracking-widest uppercase">Partenaire caritatif</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center mb-5">
            <div className="bg-obsidian-900 px-4 py-2 border border-red-900/20" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <img src={fondationLogo} alt="Logo officiel de la Fondation du Cégep de Saint-Félicien" className="h-12 w-auto object-contain" />
            </div>
          </div>
          <p className="font-mono text-red-400/60 text-xs tracking-[0.5em] uppercase mb-4">
            [ Partenaire caritatif officiel ]
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
            La{' '}
            <span
              style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '1px rgba(239,68,68,0.7)' }}
            >
              Fondation
            </span>
          </h2>
          <p className="font-body text-zinc-500 text-base mt-2 tracking-wide">du Cégep de Saint-Félicien</p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left — Branding */}
          <motion.div
            variants={scrollRevealLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col items-center lg:items-start gap-8"
          >
            {/* Heart icon + title */}
            <div className="flex flex-col items-center lg:items-start gap-6">
              <PulsingHeart />

              <div className="text-center lg:text-left">
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Au-delà du gaming
                </h3>
                <p className="font-body text-zinc-400 leading-relaxed">
                  LAN Gaming 2026 s'inscrit dans une démarche plus grande. Les dons Twitch en direct ainsi que les ventes de <span className="text-ember-300 font-semibold">Tickets d'Or</span> (moitié-moitié) sont intégralement reversés à la Fondation du Cégep, qui soutient des dizaines d'étudiants chaque année.
                </p>
              </div>
            </div>

            {/* Mission list */}
            <div className="w-full">
              <p className="font-mono text-ember-500 text-xs tracking-widest uppercase mb-4">
                Leur mission :
              </p>
              <ul className="space-y-3">
                {FOUNDATION_MISSIONS.map((mission, i) => (
                  <MissionItem key={i} text={mission} index={i} />
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
              <motion.a
                href="https://www.fondation.cstfelicien.qc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <span className="font-body font-semibold text-red-400 text-sm tracking-wide group-hover:text-red-300 transition-colors">
                  Découvrir la Fondation
                </span>
                <ArrowRight size={14} className="text-red-400 group-hover:text-red-300 transition-colors" />
              </motion.a>
              <span className="text-zinc-700 hidden sm:block">·</span>
              <motion.a
                href="https://www.cstfelicien.qc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <span className="font-body text-zinc-500 text-sm tracking-wide group-hover:text-zinc-300 transition-colors">
                  Site du Cégep
                </span>
                <ArrowRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </motion.a>
            </div>
          </motion.div>

          {/* Right — Stats + quote */}
          <motion.div
            variants={scrollRevealRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col gap-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {FOUNDATION_STATS.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} />
              ))}
            </div>

            {/* Featured quote / callout */}
            <div className="border border-red-900/30 bg-blood-dark/20 p-6 md:p-8 relative">
              <div className="absolute top-0 left-6 -translate-y-px w-16 h-px bg-gradient-to-r from-transparent via-red-700 to-transparent" />

              <p className="font-rune text-red-300/80 text-lg leading-relaxed mb-6">
                "Chaque ticket acheté pour LAN Gaming 2026, c'est un coup de pouce concret pour un étudiant qui en a besoin."
              </p>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 clip-hex bg-blood-mid flex items-center justify-center">
                  <Heart size={14} className="text-red-300 fill-red-300" />
                </div>
                <div>
                  <p className="font-display text-red-300 text-xs font-bold tracking-wide">
                    Fondation du Cégep de Saint-Félicien
                  </p>
                  <p className="font-mono text-zinc-700 text-[10px] tracking-widest">
                    PARTENAIRE CARITATIF OFFICIEL
                  </p>
                </div>
              </div>
            </div>

            {/* Visual element — allocation donut placeholder */}
            <div className="border border-ember-400/10 bg-glass p-6 flex items-center gap-6">
              {/* Donut chart visual */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#1A2332" strokeWidth="12" />
                  <motion.circle
                    cx="40" cy="40" r="30" fill="none" stroke="#C89B3C" strokeWidth="12"
                    strokeDasharray={`${188.5 * 0.7} ${188.5 * 0.3}`}
                    initial={{ strokeDashoffset: 188.5 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: EASE_GAME }}
                  />
                  <motion.circle
                    cx="40" cy="40" r="30" fill="none" stroke="#8B0000" strokeWidth="12"
                    strokeDasharray={`${188.5 * 0.15} ${188.5 * 0.85}`}
                    strokeDashoffset={`${-188.5 * 0.7}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-ember-300 text-xs font-bold">15%</span>
                </div>
              </div>

              <div>
                <p className="font-body text-zinc-300 text-sm font-semibold mb-1">Reversement caritatif</p>
                <p className="font-body text-zinc-600 text-xs leading-relaxed">
                  15% des profits nets de l'événement sont reversés directement à la Fondation du Cégep.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-ember-400" />
                    <span className="font-mono text-zinc-600 text-[10px]">Événement</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-800" />
                    <span className="font-mono text-zinc-600 text-[10px]">Fondation</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gallery section */}
        <FoundationGallery />
      </div>
    </section>
  );
}
