import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Gamepad2, Trophy, ArrowRight } from "lucide-react";
import { scrollReveal, staggerContainer, fadeInUp, EASE_GAME } from "../../utils/animations.js";

const PATHS = [
  { key: "visiteur", title: "Visiteur", price: "15$", color: "#4FC3F7", icon: Eye, blurb: "Regarder, spectateur libre" },
  { key: "joueur", title: "Joueur LAN", price: "30$", color: "#C89B3C", icon: Gamepad2, blurb: "Ton poste, 47h de gaming" },
  { key: "competiteur", title: "Compétiteur", price: "45$", color: "#FFD700", icon: Trophy, blurb: "Tournois officiels, cash prizes" },
];

export default function ExperienceTeaser() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-obsidian-900" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <motion.p
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            [ Comment vivre la LAN ]
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-5xl font-black text-white uppercase tracking-tight"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Trois façons d'y{" "}
            <span className="text-ember-300 text-ember-glow">participer</span>
          </motion.h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4 mb-8"
        >
          {PATHS.map(({ key, title, price, color, icon: Icon, blurb }) => (
            <motion.div
              key={key}
              variants={fadeInUp}
              whileHover={{ y: -3, borderColor: `${color}70` }}
              transition={{ duration: 0.25, ease: EASE_GAME }}
              className="flex flex-col items-center text-center gap-2 border bg-obsidian-800/60 px-5 py-7"
              style={{ borderColor: `${color}25`, clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
            >
              <Icon size={22} style={{ color }} />
              <p className="font-display text-white font-bold text-sm mt-1">{title}</p>
              <p className="font-mono text-[10px] tracking-widest" style={{ color }}>{price}</p>
              <p className="font-body text-zinc-500 text-xs">{blurb}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/experience"
            className="inline-flex items-center gap-2 font-mono text-xs text-ember-400 border border-ember-400/30 px-6 py-3 hover:border-ember-400 hover:bg-ember-400/5 transition-all duration-300 tracking-widest uppercase"
          >
            Détailler les trois parcours <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
