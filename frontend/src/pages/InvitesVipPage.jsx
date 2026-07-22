import React from 'react';
import { motion } from 'framer-motion';
import {
  Instagram, Youtube, Facebook, Crown, Sparkles,
  Calendar, ChevronRight, Gamepad2, Star,
} from 'lucide-react';
import { pageTransition, fadeInUp, staggerContainer, scrollReveal, EASE_GAME } from '../utils/animations.js';

import cocotteImg from '../assets/VIP/cocotte.jpg';
import koriassImg from '../assets/VIP/Koriass.jpg';
import sandfallImg from '../assets/VIP/Standfall.jpg';
import ubisoftLogo from '../assets/VIP/ubisoft.png';

// ── Brand marks not covered by lucide-react ──────────────────────────────────
function SpotifyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.14 4.32-1.32 9.719-.66 13.379 1.621.361.181.54.78.36 1.199zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" {...props}>
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────
const VIPS = [
  {
    id: 'cocotte',
    name: 'Cocotte',
    handle: '@cocottee_',
    role: 'Streameuse & créatrice de contenu',
    tag: 'Créatrice invitée',
    image: cocotteImg,
    accent: '#FF4655',
    bio: "Étoile montante du streaming québécois sur Twitch, TikTok, Instagram et YouTube, Cocotte s'est fait remarquer aux côtés de créateurs internationaux comme Squeezie lors du GP Explorer, où elle a défendu haut et fort les couleurs du Québec. Reconnue pour son énergie contagieuse et ses lives gaming endiablés, elle sera présente pour un meet & greet et des sessions de jeu avec les participants.",
    stats: [
      { platform: 'Instagram', icon: Instagram, value: '1M', color: '#E1306C' },
      { platform: 'TikTok', icon: TikTokIcon, value: '1.7M', color: '#25F4EE' },
    ],
  },
  {
    id: 'koriass',
    name: 'Koriass',
    handle: '@koriassreal',
    role: 'Rappeur & auteur-compositeur',
    tag: 'Invité musical',
    image: koriassImg,
    accent: '#C89B3C',
    bio: "Figure incontournable du hip-hop québécois, Koriass cumule des dizaines de millions d'écoutes et de vues à travers sa discographie. Fraîchement de retour avec le single « Sept ans de malheur » feat. Daniel Bélanger, il montera sur scène lors de la grande finale du samedi soir pour un set exclusif avant la diffusion Twitch caritative.",
    stats: [
      { platform: 'Spotify', icon: SpotifyIcon, value: '132K auditeurs/mois', color: '#1DB954' },
      { platform: 'Instagram', icon: Instagram, value: '70K', color: '#E1306C' },
      { platform: 'YouTube', icon: Youtube, value: '20M+ vues cumulées', color: '#FF0000' },
      { platform: 'Facebook', icon: Facebook, value: '113K', color: '#1877F2' },
    ],
  },
  {
    id: 'sandfall',
    name: 'Sandfall Interactive',
    handle: '@sandfallgames',
    role: 'Studio de développement — Montpellier, France',
    tag: 'Studio partenaire',
    image: sandfallImg,
    accent: '#4FC3F7',
    bio: "Le studio français derrière Clair Obscur: Expedition 33, le RPG au tour par tour salué mondialement — et dont l'univers a directement inspiré l'identité visuelle « Clair-Obscur » de LAN Gaming 2026. L'équipe de Sandfall Interactive sera sur place pour présenter les coulisses de leur création et un aperçu de leur prochain projet.",
    stats: [
      { platform: 'Instagram', icon: Instagram, value: '153K', color: '#E1306C' },
      { platform: 'Facebook', icon: Facebook, value: '34K', color: '#1877F2' },
    ],
  },
];

const UBISOFT_GAMES = [
  {
    name: 'Rayman Legends Retold',
    date: 'Octobre 2026',
    badge: 'Sortie pendant l\'événement',
    badgeColor: '#FFD700',
    desc: "Le retour du plombier légendaire pour le 30ᵉ anniversaire de la licence, entièrement retravaillé. Sa sortie tombe pile durant le week-end du LAN !",
  },
  {
    name: 'Assassin\'s Creed Codename Hexe',
    date: 'Date à venir',
    badge: 'Démo exclusive',
    badgeColor: '#7C3AED',
    desc: "Un nouveau chapitre mystérieux de la saga, teasé par un talisman gravé au cœur d'une forêt sombre. Premier aperçu jouable réservé au LAN 2026.",
  },
  {
    name: 'Splinter Cell Remake',
    date: '2026 – 2027',
    badge: 'Avant-première',
    badgeColor: '#4FC3F7',
    desc: "Sam Fisher revient dans une refonte complète du classique de l'infiltration, moteur et gameplay entièrement modernisés.",
  },
  {
    name: 'Ghost Recon — nouveau volet',
    date: '2026',
    badge: 'Avant-première',
    badgeColor: '#22c55e',
    desc: "Une approche plus tactique et immersive à la première personne pour la prochaine mission de la licence Ghost Recon.",
  },
];

// ── VIP Card ─────────────────────────────────────────────────────────────────
function VipCard({ vip, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative bg-obsidian-800 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-obsidian-700">
        <img
          src={vip.image}
          alt={vip.name}
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-obsidian-900/10 to-transparent" />
        <div
          className="absolute top-3 left-3 px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase font-bold"
          style={{ background: `${vip.accent}20`, border: `1px solid ${vip.accent}60`, color: vip.accent }}
        >
          {vip.tag}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display text-white text-xl font-black leading-snug">{vip.name}</h3>
        <p className="font-mono text-[10px] tracking-widest mt-1" style={{ color: vip.accent }}>{vip.handle}</p>
        <p className="font-body text-zinc-400 text-xs tracking-wide uppercase mt-1 mb-3">{vip.role}</p>

        <p className="font-body text-zinc-400 text-sm leading-relaxed mb-4">{vip.bio}</p>

        {/* Follower stats */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-800">
          {vip.stats.map(({ platform, icon: Icon, value, color }) => (
            <div
              key={platform}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 bg-obsidian-900/60"
              title={platform}
            >
              <Icon size={12} style={{ color }} />
              <span className="font-mono text-zinc-300 text-[10px] tracking-wide">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-0 group-hover:w-full transition-all duration-500" style={{ background: `linear-gradient(to right, transparent, ${vip.accent}, transparent)` }} />
    </motion.div>
  );
}

// ── Ubisoft Game Card ──────────────────────────────────────────────────────
function GameCard({ game }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="relative bg-obsidian-900/60 border border-zinc-800 hover:border-zinc-600 p-5 transition-all duration-300"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Gamepad2 size={18} className="text-ember-400 flex-shrink-0 mt-0.5" />
        <span
          className="px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase font-bold flex-shrink-0"
          style={{ background: `${game.badgeColor}20`, border: `1px solid ${game.badgeColor}60`, color: game.badgeColor }}
        >
          {game.badge}
        </span>
      </div>
      <h4 className="font-display text-white text-base font-bold leading-snug mb-1">{game.name}</h4>
      <p className="font-mono text-ember-500 text-[10px] tracking-widest uppercase mb-3 flex items-center gap-1.5">
        <Calendar size={10} /> {game.date}
      </p>
      <p className="font-body text-zinc-500 text-sm leading-relaxed">{game.desc}</p>
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
              Créateurs, artiste et studio de renom se joignent à LAN Gaming 2026 — plus un partenariat exclusif avec Ubisoft pour des avant-premières jouables sur place.
            </p>
          </motion.div>
        </div>
      </div>

      {/* VIP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
        >
          {VIPS.map((vip, i) => <VipCard key={vip.id} vip={vip} index={i} />)}
        </motion.div>
      </div>

      {/* Ubisoft Exclusive Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
        <motion.div
          variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center gap-4 mb-5">
            <div className="bg-ember-100 px-5 py-3" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
              <img src={ubisoftLogo} alt="Ubisoft" className="h-9 w-auto object-contain" />
            </div>
          </div>
          <p className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3 flex items-center justify-center gap-2">
            <Sparkles size={13} /> [ Partenariat exclusif ]
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-black text-white uppercase leading-tight">
            Avant-premières <span className="text-ember-300 text-ember-glow">Ubisoft</span>
          </h2>
          <p className="font-body text-zinc-500 text-sm mt-4 max-w-2xl mx-auto leading-relaxed">
            Ubisoft nous rejoint avec des démos jouables en exclusivité pendant tout le week-end — plusieurs titres à découvrir en avant-première avant leur sortie officielle.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
        >
          {UBISOFT_GAMES.map((game) => <GameCard key={game.name} game={game} />)}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        className="max-w-lg mx-auto mt-24 px-4 text-center border border-ember-400/15 bg-obsidian-800/60 p-8"
        variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
        style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
      >
        <Star size={24} className="text-ember-400 mx-auto mb-3" />
        <p className="font-display text-white font-bold text-lg mb-2">Envie de rencontrer nos invités ?</p>
        <p className="font-body text-zinc-500 text-sm mb-5 leading-relaxed">
          Réserve ta place dès maintenant pour le meet & greet, le set exclusif de Koriass et les démos Ubisoft en avant-première.
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
