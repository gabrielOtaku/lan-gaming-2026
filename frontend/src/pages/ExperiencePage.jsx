import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Gamepad2, Trophy, Check, ArrowRight } from "lucide-react";
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  scrollReveal,
  EASE_GAME,
} from "../utils/animations.js";

// Pas de prix ni de durée précise ici tant que la billetterie n'est pas
// ouverte (cahier §3) — seuls les trois tournois officiellement confirmés
// (LoL, CS2, Rocket League) sont listés.
const PATHS = [
  {
    key: "visiteur",
    title: "Visiteur",
    color: "#4FC3F7",
    icon: Eye,
    tagline: "Vivre l'ambiance sans jouer",
    points: [
      "Accès libre à l'ensemble de l'événement",
      "Zone spectateurs devant la scène principale",
      "Accès aux consoles et à l'arcade libre",
      "Kiosques partenaires",
      "Aucune restriction d'âge",
    ],
  },
  {
    key: "joueur",
    title: "Joueur LAN",
    color: "#C89B3C",
    icon: Gamepad2,
    tagline: "Ton propre poste, tout le week-end",
    points: [
      "Poste LAN fixe pendant tout l'événement",
      "Accès à toutes les arènes",
      "Apporte ton PC + écran (max 1 de chacun)",
      "Réseau fourni sur place",
      "17 ans et plus",
    ],
  },
  {
    key: "competiteur",
    title: "Compétiteur",
    color: "#FFD700",
    icon: Trophy,
    tagline: "Tout du joueur, plus les tournois officiels",
    points: [
      "Tout ce qu'inclut le billet Joueur",
      "Inscription officielle aux tournois",
      "LoL, CS2, Rocket League",
      "17 ans et plus",
    ],
  },
];

function PathCard({ path, index }) {
  const Icon = path.icon;
  return (
    <motion.div
      variants={fadeInUp}
      className="relative flex flex-col border bg-obsidian-800/80 p-6 md:p-8"
      style={{
        borderColor: `${path.color}30`,
        clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
      }}
      whileHover={{ borderColor: `${path.color}70`, y: -4 }}
      transition={{ duration: 0.25, ease: EASE_GAME }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center mb-5"
        style={{ background: `${path.color}15`, border: `1px solid ${path.color}40` }}
      >
        <Icon size={22} style={{ color: path.color }} />
      </div>

      <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: path.color }}>
        Parcours {String(index + 1).padStart(2, "0")}
      </p>
      <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-1">{path.title}</h2>
      <p className="font-body text-zinc-500 text-sm mb-6">{path.tagline}</p>

      <ul className="space-y-2.5 mb-8 flex-1">
        {path.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: path.color }} />
            <span className="font-body text-zinc-400 text-sm leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/billetterie"
        className="flex items-center justify-center gap-2 py-3.5 font-display font-bold text-sm tracking-widest uppercase text-obsidian-900 transition-transform hover:scale-[1.02]"
        style={{ background: path.color, clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
      >
        Choisir {path.title} <ArrowRight size={15} />
      </Link>
    </motion.div>
  );
}

export default function ExperiencePage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-24 relative overflow-hidden"
    >
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center mb-14">
          <motion.p variants={fadeInUp} className="font-mono text-ember-600 text-xs tracking-[0.5em] uppercase mb-4">
            [ Trois façons de vivre la LAN ]
          </motion.p>
          <motion.h1 variants={fadeInUp} className="font-display text-5xl sm:text-6xl font-black uppercase text-white leading-none mb-4">
            Ton <span className="text-ember-300 text-ember-glow">Expérience</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="font-body text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            Que tu viennes regarder, jouer en libre ou viser le podium des tournois officiels, il y a un billet fait pour toi.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {PATHS.map((path, i) => (
            <PathCard key={path.key} path={path} index={i} />
          ))}
        </motion.div>

        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <Link
            to="/infos-pratiques"
            className="flex items-center justify-between px-5 py-4 border border-zinc-800 bg-obsidian-800/60 hover:border-zinc-600 transition-colors group"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
          >
            <span className="font-body text-zinc-300 group-hover:text-white text-sm transition-colors">
              Matériel, repas, sommeil, âge, stationnement → Infos pratiques
            </span>
            <ArrowRight size={14} className="text-zinc-600 flex-shrink-0" />
          </Link>
          <Link
            to="/calendrier"
            className="flex items-center justify-between px-5 py-4 border border-zinc-800 bg-obsidian-800/60 hover:border-zinc-600 transition-colors group"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
          >
            <span className="font-body text-zinc-300 group-hover:text-white text-sm transition-colors">
              Voir le programme complet du vendredi au dimanche
            </span>
            <ArrowRight size={14} className="text-zinc-600 flex-shrink-0" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
