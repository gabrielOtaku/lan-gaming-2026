import React, { useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { scrollReveal, scrollRevealLeft, scrollRevealRight, staggerContainer, EASE_GAME } from '../../utils/animations.js';

const CONCEPT_BLOCKS = [
  {
    year: '2023',
    title: 'Les origines — Salon 108',
    body: `Avril 2023. 70+ passionnés envahissent le salon du Cégep de Saint-Félicien. Pas une arène professionnelle — juste des étudiants, des câbles, et une énergie brute indiscutable. Un stream Twitch 24h/24 avec des casteurs dévoués, des tournois épiques, et des partenaires de folie comme Ubisoft. La première LAN Gaming CSF gravait déjà son nom dans la mémoire collective.`,
    accent: '#C89B3C',
    icon: '⚡',
  },
  {
    year: '2025',
    title: 'La renaissance — Septembre',
    body: `Le projet renaît en septembre 2025 avec un camarade et une ambition décuplée. Mais la réalité frappe fort : imprévus sur imprévus, obstacles à répétition. La date initialement prévue est repoussée. Le rêve ne s'est pas éteint — il a juste eu besoin d'un peu plus de temps pour mûrir.`,
    accent: '#FF4655',
    icon: '🔥',
  },
  {
    year: '2026',
    title: 'La forge — Gabriel & Jovan',
    body: `Janvier 2026. Gabriel reprend le projet et rencontre Jovan — un partenaire qui apporte une valeur immense. Ensemble, ils rebâtissent tout. L'équipe de première année en informatique du Cégep se joint à l'aventure, prenant en charge de nombreuses tâches pour que Gabriel et Jovan puissent se concentrer sur l'essentiel : les partenaires, la communication, la vision. Malgré d'autres imprévus, l'équipe tient bon et avance.`,
    accent: '#4FC3F7',
    icon: '🛡️',
  },
  {
    year: '2026',
    title: 'La légende — Octobre',
    body: `LAN Gaming 2026 naît de l'ambition de reproduire la même vibe que cette première édition tant appréciée — mais en voyant les choses en bien plus grand. Notre but : faire de cet événement une histoire indélébile dont tout le monde se souviendra. 47 heures. Un maximum de guerriers. Que le grind commence.`,
    accent: '#FFD700',
    icon: '👑',
  },
];

// ── Animated line connector ───────────────────────────────────────────────────
function TimelineConnector({ color }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className="hidden md:flex flex-col items-center flex-shrink-0 mx-8">
      <motion.div
        className="w-px"
        style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }}
        animate={{ height: inView ? 120 : 0 }}
        transition={{ duration: 0.8, ease: EASE_GAME }}
      />
    </div>
  );
}

// ── Single concept card ───────────────────────────────────────────────────────
function ConceptCard({ block, index }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      variants={isEven ? scrollRevealLeft : scrollRevealRight}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Year pillar */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <motion.div
          className="w-16 h-16 clip-hex flex items-center justify-center text-2xl"
          style={{ background: `radial-gradient(circle, ${block.accent}22, transparent)`, border: `1px solid ${block.accent}40` }}
          animate={inView ? {
            boxShadow: [`0 0 0px ${block.accent}00`, `0 0 25px ${block.accent}60`, `0 0 10px ${block.accent}30`],
          } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span>{block.icon}</span>
        </motion.div>
        <p className="font-mono text-xs tracking-widest" style={{ color: block.accent }}>
          {block.year}
        </p>
      </div>

      {/* Content */}
      <div className={`flex-1 ${isEven ? 'md:pr-16' : 'md:pl-16'}`}>
        <motion.div
          className="relative p-6 md:p-8 border border-transparent bg-glass"
          style={{ borderColor: `${block.accent}20` }}
          whileHover={{
            borderColor: `${block.accent}50`,
            boxShadow: `0 0 30px ${block.accent}15`,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Corner accent */}
          <div
            className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2"
            style={{ borderColor: block.accent }}
          />
          <div
            className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2"
            style={{ borderColor: block.accent }}
          />

          <h3
            className="font-display text-xl md:text-2xl font-bold mb-4 tracking-wide"
            style={{ color: block.accent }}
          >
            {block.title}
          </h3>
          <p className="font-body text-zinc-400 leading-relaxed text-base md:text-lg font-light">
            {block.body}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Parallax section title ────────────────────────────────────────────────────
function SectionTitle() {
  const ref = useRef();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <motion.div ref={ref} style={{ y }} className="text-center mb-20">
      <motion.p
        className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4"
        variants={scrollReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        [ Notre histoire ]
      </motion.p>
      <motion.h2
        className="font-display text-4xl md:text-6xl font-black text-white uppercase tracking-tight"
        variants={scrollReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        Le{' '}
        <span
          className="text-ember-glow"
          style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '1px #C89B3C' }}
        >
          Concept
        </span>
      </motion.h2>
      <motion.div
        className="h-px max-w-xs mx-auto mt-6 bg-gradient-to-r from-transparent via-ember-400 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_GAME }}
      />
    </motion.div>
  );
}

// ── Maelle showcase — companion quote card ────────────────────────────────────
// Le modèle 3D (maelle.glb, ~22 Mo) a été retiré : trop lourd pour une V1
// mobile-first stable et fluide. La citation reste affichée sans rendu WebGL.
function MaelleShowcase() {
  return (
    <motion.div
      className="mt-16 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 sm:gap-10 items-center border border-rune-blue/15 bg-glass p-6 md:p-10 relative"
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-32 h-px bg-gradient-to-r from-transparent via-rune-blue to-transparent" />

      <div className="w-full sm:w-40 h-48 sm:h-56 mx-auto flex-shrink-0 flex items-center justify-center">
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 clip-hex flex items-center justify-center text-4xl"
          style={{ background: 'radial-gradient(circle, rgba(79,195,247,0.15), transparent)', border: '1px solid rgba(79,195,247,0.3)' }}
        >
          🎨
        </div>
      </div>

      <div className="text-center sm:text-left">
        <p className="font-mono text-rune-blue/70 text-[10px] tracking-widest uppercase mb-3">
          Maelle · Expéditionnaire
        </p>
        <p className="font-rune text-rune-blue text-lg md:text-2xl leading-relaxed" style={{ textShadow: '0 0 20px rgba(79,195,247,0.35)' }}>
          "Chaque coup de pinceau efface un peu plus le monde. Alors on avance —
          pas pour l'arrêter, mais pour que ce qui compte survive au tableau."
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function BioConcept() {
  return (
    <section className="relative py-24 md:py-40 overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900 via-obsidian-800 to-obsidian-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,155,60,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <SectionTitle />

        {/* Cards */}
        <div className="flex flex-col gap-12 md:gap-20">
          {CONCEPT_BLOCKS.map((block, i) => (
            <React.Fragment key={`${block.year}-${block.title}`}>
              <ConceptCard block={block} index={i} />
              {i < CONCEPT_BLOCKS.length - 1 && (
                <div className="flex justify-center">
                  <motion.div
                    className="w-px h-16 bg-gradient-to-b from-ember-500/50 to-transparent"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <MaelleShowcase />

        {/* Bottom quote */}
        <motion.div
          className="mt-24 text-center border border-ember-400/15 bg-glass p-8 md:p-12 relative"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-32 h-px bg-gradient-to-r from-transparent via-ember-400 to-transparent" />
          <p className="font-rune text-ember-300 text-xl md:text-3xl leading-relaxed text-gold-glow">
            "Le gaming n'est pas un passe-temps.<br />
            C'est une culture. C'est une communauté.<br />
            C'est une langue universelle."
          </p>
          <p className="font-mono text-zinc-600 text-xs tracking-widest mt-6">
            — ÉQUIPE LAN GAMING 2026 · CSF
          </p>
        </motion.div>
      </div>
    </section>
  );
}
