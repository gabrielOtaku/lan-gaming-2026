import { motion } from "framer-motion";

const Logo = ({ className = "w-12 h-12" }) => {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <defs>
        {/* Filtres de lueur (Glow) respectant ta DA */}
        <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Dégradé métallique God of War */}
        <linearGradient id="grad-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8e7a2" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8a6d1c" />
        </linearGradient>
      </defs>

      {/* Fond Bouclier Esport */}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        d="M200 20 L350 70 V220 C350 310 200 380 200 380 C200 380 50 310 50 220 V70 L200 20 Z"
        fill="#0a0a0a"
        stroke="#d4af37"
        strokeWidth="8"
        filter="url(#glow-gold)"
      />

      {/* Empreinte intérieure agressive (Rouge Gaming) */}
      <path
        d="M200 60 L310 100 V210 C310 270 200 330 200 330 C200 330 90 270 90 210 V100 L200 60 Z"
        fill="none"
        stroke="#c21f1f"
        strokeWidth="6"
        filter="url(#glow-red)"
      />

      {/* Forme du "C" (pour Cégep) façon câble réseau */}
      <path
        d="M240 140 A 60 60 0 1 0 240 260"
        fill="none"
        stroke="url(#grad-gold)"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Nœuds de connexion (LAN) */}
      <circle cx="240" cy="140" r="15" fill="#c21f1f" />
      <circle cx="240" cy="260" r="15" fill="#c21f1f" />
      <motion.circle
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        cx="140"
        cy="200"
        r="18"
        fill="#d4af37"
      />

      {/* Câbles de routage */}
      <line
        x1="140"
        y1="200"
        x2="240"
        y2="140"
        stroke="#d4af37"
        strokeWidth="4"
      />
      <line
        x1="140"
        y1="200"
        x2="240"
        y2="260"
        stroke="#d4af37"
        strokeWidth="4"
      />

      {/* Étoile Centrale (Pour marquer la 10e Édition) */}
      <motion.path
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        d="M200 160 L210 190 L240 200 L210 210 L200 240 L190 210 L160 200 L190 190 Z"
        fill="#ffffff"
        filter="url(#glow-gold)"
        style={{ transformOrigin: "200px 200px" }}
      />
    </motion.svg>
  );
};

export default Logo;
