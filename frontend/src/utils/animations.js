// ══════════════════════════════════════════════════════════════════════════════
// animations.js — Librairie de variants Framer Motion | LAN Gaming 2026
// ══════════════════════════════════════════════════════════════════════════════

// ── Easing Curves Gaming ────────────────────────────────────────────────────
export const EASE_DRAMATIC = [0.77, 0, 0.18, 1];
export const EASE_GAME = [0.16, 1, 0.3, 1];
export const EASE_ELASTIC = { type: 'spring', stiffness: 200, damping: 20 };
export const EASE_HEAVY = [0.43, 0.13, 0.23, 0.96];

// ── Fade Variants ────────────────────────────────────────────────────────────
export const fadeInUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE_GAME },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -60, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE_GAME },
  },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 60, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE_GAME },
  },
};

// ── Scale Variants ───────────────────────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_GAME },
  },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleInDramatic = {
  hidden: { opacity: 0, scale: 1.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: EASE_DRAMATIC },
  },
};

// ── Stagger Container ────────────────────────────────────────────────────────
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// ── Text Reveal ─────────────────────────────────────────────────────────────
export const textReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.8, ease: EASE_DRAMATIC },
  },
};

export const letterReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 12 },
  },
};

// ── Page Transitions ─────────────────────────────────────────────────────────
export const pageTransition = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_GAME },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: EASE_HEAVY },
  },
};

export const pageSlide = {
  initial: { opacity: 0, x: '100%' },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_DRAMATIC },
  },
  exit: {
    opacity: 0,
    x: '-100%',
    transition: { duration: 0.4 },
  },
};

// ── Card Hover ───────────────────────────────────────────────────────────────
export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 0 0px rgba(200,155,60,0)',
    transition: { duration: 0.3, ease: EASE_GAME },
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 30px rgba(200,155,60,0.5), 0 0 60px rgba(200,155,60,0.2)',
    transition: { duration: 0.3, ease: EASE_GAME },
  },
  tap: { scale: 0.98 },
};

// ── Ember Particle ───────────────────────────────────────────────────────────
export const emberParticle = {
  hidden: { opacity: 0, scale: 0, y: 0 },
  visible: (i) => ({
    opacity: [0, 0.8, 0],
    scale: [0, 1, 0.5],
    y: [0, -80 - i * 20],
    x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5)],
    transition: {
      duration: 2 + i * 0.3,
      repeat: Infinity,
      delay: i * 0.4,
      ease: 'easeOut',
    },
  }),
};

// ── Gold Shimmer ─────────────────────────────────────────────────────────────
export const goldShimmer = {
  initial: { backgroundPosition: '-200% center' },
  animate: {
    backgroundPosition: '200% center',
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },
};

// ── Loader ───────────────────────────────────────────────────────────────────
export const loaderExit = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: { duration: 0.8, ease: EASE_DRAMATIC },
  },
};

export const loaderBar = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 2.5, ease: EASE_DRAMATIC },
  },
};

// ── Modal ────────────────────────────────────────────────────────────────────
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const modalPanel = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_GAME },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 40,
    transition: { duration: 0.3 },
  },
};

// ── Scroll Reveal (pour useInView) ──────────────────────────────────────────
export const scrollReveal = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_GAME },
  },
};

export const scrollRevealLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: EASE_GAME },
  },
};

export const scrollRevealRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: EASE_GAME },
  },
};
