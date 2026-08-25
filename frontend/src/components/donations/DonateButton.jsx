import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ExternalLink } from "lucide-react";

const DONATION_URL = import.meta.env.VITE_STRIPE_DONATION_URL;

// Lien direct vers le Stripe Payment Link — le choix du montant, du pseudo
// et de l'anonymat se fait sur la page hébergée par Stripe (§4 du guide),
// pas ici. Aucun appel serveur : ce composant ne fait jamais avancer la
// cagnotte lui-même.
export default function DonateButton({ label = "Faire un don", className = "" }) {
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
