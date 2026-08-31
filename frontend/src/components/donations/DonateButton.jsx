import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ExternalLink, Lock } from "lucide-react";

const DONATION_URL = import.meta.env.VITE_STRIPE_DONATION_URL;

// Lien direct vers le Stripe Payment Link — le choix du montant, du pseudo
// et de l'anonymat se fait sur la page hébergée par Stripe (§4 du guide),
// pas ici. Aucun appel serveur : ce composant ne fait jamais avancer la
// cagnotte lui-même.
//
// comingSoon : désactive le bouton et affiche un overlay "accès bientôt
// ouvert" au lieu du lien Stripe — utilisé le temps que la campagne de dons
// soit officiellement ouverte au public.
export default function DonateButton({ label = "Faire un don", className = "", comingSoon = false }) {
  if (comingSoon) {
    return (
      <div className={`relative ${className}`}>
        <div
          aria-hidden="true"
          className="flex items-center justify-center gap-2 py-4 font-display font-black text-sm tracking-widest uppercase text-obsidian-900/50 select-none"
          style={{
            background: "linear-gradient(135deg, #C89B3C, #FFD700, #C89B3C)",
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            filter: "grayscale(0.6)",
            opacity: 0.55,
          }}
        >
          <CreditCard size={16} /> {label} <ExternalLink size={13} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-obsidian-900/75 backdrop-blur-[1px] cursor-not-allowed">
          <Lock size={13} className="text-ember-300" />
          <span className="font-mono text-ember-200 text-[11px] tracking-widest uppercase">
            Accès bientôt ouvert
          </span>
        </div>
      </div>
    );
  }

  if (!DONATION_URL) {
    return (
      <p className="font-mono text-red-400 text-xs text-center">
        Dons temporairement indisponibles.
      </p>
    );
  }

  return (
    <motion.a
      href={DONATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 py-4 font-display font-black text-sm tracking-widest uppercase text-obsidian-900 ${className}`}
      style={{
        background: "linear-gradient(135deg, #C89B3C, #FFD700, #C89B3C)",
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <CreditCard size={16} /> {label} <ExternalLink size={13} />
    </motion.a>
  );
}
