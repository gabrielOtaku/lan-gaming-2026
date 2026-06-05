// Animation de conteneur en cascade (affiche les enfants un par un)
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

// Apparition simple vers le haut (idéal pour les textes)
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

// Apparition par la droite (idéal pour les images ou cartes)
export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

// Effet de zoom léger (idéal pour les survols de boutons ou modales)
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Animation de lueur (Glow pulse) pour les éléments importants
export const pulseGlow = {
  animate: {
    boxShadow: [
      "0px 0px 10px rgba(194, 31, 31, 0.4)", // lanAccent
      "0px 0px 30px rgba(194, 31, 31, 0.8)",
      "0px 0px 10px rgba(194, 31, 31, 0.4)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
