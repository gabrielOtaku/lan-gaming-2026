import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { scrollReveal, EASE_GAME } from '../../utils/animations.js';

const LAN_PHOTOS = [
  { id: 1, src: 'https://picsum.photos/seed/lan2026a/900/600', thumb: 'https://picsum.photos/seed/lan2026a/450/300', caption: '9e édition — La salle Azimut en feu', year: '2025' },
  { id: 2, src: 'https://picsum.photos/seed/lan2026b/900/600', thumb: 'https://picsum.photos/seed/lan2026b/450/300', caption: 'Finale League of Legends — scène principale', year: '2025' },
  { id: 3, src: 'https://picsum.photos/seed/lan2026c/900/600', thumb: 'https://picsum.photos/seed/lan2026c/450/300', caption: 'Zone arènes — 80 postes allumés simultanément', year: '2024' },
  { id: 4, src: 'https://picsum.photos/seed/lan2026d/900/600', thumb: 'https://picsum.photos/seed/lan2026d/450/300', caption: 'Cérémonie de remise des trophées', year: '2024' },
  { id: 5, src: 'https://picsum.photos/seed/lan2026e/900/600', thumb: 'https://picsum.photos/seed/lan2026e/450/300', caption: 'Nuit de gaming — 3h du matin, toujours en vie', year: '2023' },
  { id: 6, src: 'https://picsum.photos/seed/lan2026f/900/600', thumb: 'https://picsum.photos/seed/lan2026f/450/300', caption: 'Zone consoles — Mario Kart tournament', year: '2023' },
  { id: 7, src: 'https://picsum.photos/seed/lan2026g/900/600', thumb: 'https://picsum.photos/seed/lan2026g/450/300', caption: 'Demi-finales CS — ambiance électrique', year: '2022' },
  { id: 8, src: 'https://picsum.photos/seed/lan2026h/900/600', thumb: 'https://picsum.photos/seed/lan2026h/450/300', caption: 'Le Cégep transformé en arène e-sport', year: '2022' },
];

function PhotoLightbox({ photos, activeIndex, onClose, onPrev, onNext }) {
  const photo = photos[activeIndex];
  if (!photo) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-obsidian-900/97 backdrop-blur-xl p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 border border-zinc-700 hover:border-ember-400/50 flex items-center justify-center text-zinc-500 hover:text-white transition-all z-10"
        aria-label="Fermer"
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 font-mono text-zinc-600 text-xs tracking-widest z-10">
        {activeIndex + 1} / {photos.length}
      </div>

      <motion.div
        className="relative max-w-4xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE_GAME }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-ember-400/60 z-10 pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-ember-400/60 z-10 pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-ember-400/60 z-10 pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-ember-400/60 z-10 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.src}
            alt={photo.caption}
            className="w-full aspect-video object-cover"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>

        {/* Caption bar */}
        <div className="bg-obsidian-800/95 border border-ember-400/10 border-t-0 px-5 py-3 flex items-center justify-between">
          <p className="font-body text-zinc-300 text-sm">{photo.caption}</p>
          <span className="font-mono text-ember-600 text-xs flex-shrink-0 ml-4">{photo.year}</span>
        </div>

        {/* Nav arrows */}
        <button
          onClick={onPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-0 w-11 h-11 bg-obsidian-900/90 border border-zinc-700 hover:border-ember-400/50 flex items-center justify-center text-zinc-400 hover:text-ember-300 transition-all"
          aria-label="Photo précédente"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-obsidian-900/90 border border-zinc-700 hover:border-ember-400/50 flex items-center justify-center text-zinc-400 hover:text-ember-300 transition-all"
          aria-label="Photo suivante"
        >
          <ChevronRight size={20} />
        </button>

        {/* Thumbnail strip */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {}}
              className={`flex-shrink-0 w-14 h-10 overflow-hidden border transition-all ${
                i === activeIndex ? 'border-ember-400' : 'border-zinc-800 opacity-50 hover:opacity-100'
              }`}
            >
              <img src={p.thumb} alt={p.caption} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Gallery card with internal parallax + hover shimmer ──────────────────────
function GalleryCard({ photo, index, onClick }) {
  const containerRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const isFeatured = index === 0 || index === 5;

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0.5, y: 0.5 });
  }, []);

  // Internal image shift — reveals different parts of the image as you hover
  const dx = (mousePos.x - 0.5) * 14;
  const dy = (mousePos.y - 0.5) * 10;

  return (
    <motion.button
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative group overflow-hidden bg-obsidian-800 border border-ember-400/10 hover:border-ember-400/40 transition-colors duration-300 ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      style={{ aspectRatio: isFeatured ? '16/10' : '4/3' }}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_GAME } },
      }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Image with internal parallax */}
      <img
        src={photo.thumb}
        alt={photo.caption}
        loading="lazy"
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${isHovered ? 1.12 : 1.04}) translate(${dx}px, ${dy}px)`,
          transition: isHovered
            ? 'transform 0.12s cubic-bezier(0.23,1,0.32,1), filter 0.4s ease'
            : 'transform 0.55s cubic-bezier(0.23,1,0.32,1), filter 0.55s ease',
          filter: isHovered ? 'grayscale(0%) brightness(1.05)' : 'grayscale(100%)',
          willChange: 'transform',
        }}
      />

      {/* Radial light following the mouse — internal reflection */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(200,155,60,0.22) 0%, rgba(200,155,60,0.06) 45%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Scanline shimmer on hover */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(200,155,60,0.04) 3px, rgba(200,155,60,0.04) 4px)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Dark gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="font-body text-white text-xs leading-tight text-left line-clamp-2">{photo.caption}</p>
        <span className="font-mono text-ember-400 text-[10px] tracking-widest mt-1 block">{photo.year}</span>
      </div>

      {/* Zoom icon */}
      <div className="absolute top-2 right-2 w-7 h-7 clip-hex bg-obsidian-900/80 border border-ember-400/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-ember-300 text-xs">⊕</span>
      </div>
    </motion.button>
  );
}

export default function LanGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex((i) => (i - 1 + LAN_PHOTOS.length) % LAN_PHOTOS.length);
  const nextPhoto = () => setLightboxIndex((i) => (i + 1) % LAN_PHOTOS.length);

  return (
    <section className="relative py-20 overflow-hidden bg-obsidian-900">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-ember-400/25 to-transparent" />
        <div className="flex justify-center -mt-3">
          <div className="px-6 py-1 bg-obsidian-900 border border-ember-400/15">
            <span className="font-mono text-ember-600/70 text-[10px] tracking-[0.4em] uppercase">Archives</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Camera size={14} className="text-ember-500" />
            <span className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase">Galerie des LAN passées</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            9 Éditions{' '}
            <span className="text-ember-300 text-ember-glow">de légendes</span>
          </h2>
          <p className="font-body text-zinc-500 max-w-lg mx-auto mt-4 text-sm leading-relaxed">
            Des souvenirs gravés dans la mémoire collective du Cégep de Saint-Félicien. Voici un aperçu des éditions précédentes.
          </p>
        </motion.div>

        {/* Masonry-style grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-auto"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {LAN_PHOTOS.map((photo, i) => (
            <GalleryCard
              key={photo.id}
              photo={photo}
              index={i}
              onClick={() => openLightbox(i)}
            />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="font-mono text-zinc-700 text-xs tracking-widest">
            LAN Gaming 2026 — La 10e édition s'annonce légendaire
          </p>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={LAN_PHOTOS}
            activeIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
