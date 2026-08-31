import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { staggerContainer, fadeInUp } from "../../utils/animations.js";
import { Zap, Shield, ChevronDown } from "lucide-react";

// ── Hero HTML/CSS/Framer léger ────────────────────────────────────────────────
// Remplace l'ancien HeroCanvas (React Three Fiber : starfield, ember core,
// mascotte Esquie, post-processing Bloom/ChromaticAberration) — cahier §2/§11 :
// conserver l'identité gaming forte via typographie, glow et micro-interactions
// CSS/Framer plutôt qu'une scène 3D lourde, pour un affichage immédiat.

// ── Fond ambiant — glows radiaux + grille CSS, suit légèrement la souris ─────
function AmbientBackground() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springX = useSpring(mx, { stiffness: 40, damping: 20 });
  const springY = useSpring(my, { stiffness: 40, damping: 20 });
  const glowX = useTransform(springX, [0, 1], ["30%", "70%"]);
  const glowY = useTransform(springY, [0, 1], ["30%", "70%"]);

  useEffect(() => {
    const onMove = (e) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #030508 0%, #07090F 55%, #0D1117 100%)" }}
      />
      {/* Glow principal — suit doucement le curseur (aucun WebGL) */}
      <motion.div
        className="absolute w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
        style={{
          left: glowX,
          top: glowY,
          background: "radial-gradient(circle, rgba(200,155,60,0.5) 0%, transparent 65%)",
        }}
      />
      {/* Grille holographique statique */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 54px, rgba(200,155,60,0.9) 54px, rgba(200,155,60,0.9) 55px), repeating-linear-gradient(90deg, transparent, transparent 54px, rgba(200,155,60,0.9) 54px, rgba(200,155,60,0.9) 55px)",
          maskImage: "radial-gradient(ellipse at 50% 35%, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 35%, black 10%, transparent 70%)",
        }}
      />
      {/* Traînées d'étincelles montantes — pur CSS */}
      {EMBERS.map((e, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-ember-300"
          style={{ left: e.left, bottom: "-10px", width: e.size, height: e.size, boxShadow: "0 0 6px rgba(255,215,0,0.8)" }}
          animate={{ y: [0, -600], opacity: [0, 0.8, 0] }}
          transition={{ duration: e.duration, repeat: Infinity, delay: e.delay, ease: "easeOut" }}
        />
      ))}
      {/* Vignette + fondu bas de section */}
      <div className="absolute inset-0 bg-blood-vignette" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian-900 to-transparent" />
    </div>
  );
}

const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${4 + i * 7}%`,
  size: 2 + (i % 3),
  duration: 6 + (i % 5),
  delay: i * 0.6,
}));

// ── Futuristic HUD Timer (pur CSS/Framer, conservé tel quel) ─────────────────
function TimerDigit({ value, label, code }) {
  const padded = String(value).padStart(2, "0");
  const [prev, setPrev] = useState(padded);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (padded !== prev) {
      setFlip(true);
      const t = setTimeout(() => {
        setPrev(padded);
        setFlip(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [padded, prev]);

  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-ember-600 text-[8px] tracking-[0.4em] uppercase mb-1.5">{code}</span>
      <div
        className="relative flex items-center justify-center w-16 md:w-20 h-14 md:h-16 bg-obsidian-900/90 border border-ember-400/30"
        style={{
          clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
          boxShadow: "0 0 20px rgba(200,155,60,0.15), inset 0 0 15px rgba(200,155,60,0.05)",
        }}
      >
        <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.12 }}>
          <motion.div
            className="absolute left-0 right-0 h-6 bg-gradient-to-b from-transparent via-ember-400/30 to-transparent"
            animate={{ top: ["-40%", "120%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
          />
        </motion.div>
        <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-ember-400/50" />
        <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-ember-400/50" />
        <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-ember-400/50" />
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-ember-400/50" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={padded}
            initial={{ y: flip ? -20 : 0, opacity: flip ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="font-mono font-black text-2xl md:text-3xl text-white relative z-10"
            style={{ textShadow: "0 0 12px rgba(200,155,60,0.8), 0 0 30px rgba(200,155,60,0.3)", fontFeatureSettings: '"tnum"' }}
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="font-mono text-zinc-600 text-[9px] tracking-[0.3em] uppercase mt-1.5">{label}</span>
    </div>
  );
}

function FuturisticTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const target = new Date("2026-10-09T17:00:00").getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins: Math.floor((diff % 3600000) / 60000),
          secs: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 80);
    }, 7000 + Math.random() * 5000);
    return () => { clearInterval(id); clearInterval(glitchInterval); };
  }, []);

  const units = [
    { value: timeLeft.days, label: "Jours", code: "D" },
    { value: timeLeft.hours, label: "Heures", code: "H" },
    { value: timeLeft.mins, label: "Min", code: "M" },
    { value: timeLeft.secs, label: "Sec", code: "S" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <motion.div
        className="relative"
        animate={glitch ? { x: [0, -3, 2, -1, 0], filter: ["none", "hue-rotate(30deg)", "none"] } : {}}
        transition={{ duration: 0.08 }}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="font-mono text-ember-500 text-[9px] tracking-[0.4em] uppercase">Compte à rebours</span>
          </div>
          <span className="font-mono text-zinc-700 text-[9px] tracking-widest">LAN_2026 · OCT_9_10_11</span>
        </div>

        <div
          className="relative bg-obsidian-900/80 backdrop-blur-md border border-ember-400/20 px-4 py-4"
          style={{
            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
            boxShadow: "0 0 40px rgba(200,155,60,0.08), inset 0 0 40px rgba(3,5,8,0.6)",
          }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ boxShadow: ["inset 0 0 20px rgba(200,155,60,0.05)", "inset 0 0 40px rgba(200,155,60,0.12)", "inset 0 0 20px rgba(200,155,60,0.05)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-3 h-3`}>
              <div
                className="w-full h-full"
                style={{
                  borderTop: i < 2 ? "1px solid" : "none",
                  borderBottom: i >= 2 ? "1px solid" : "none",
                  borderLeft: i % 2 === 0 ? "1px solid" : "none",
                  borderRight: i % 2 === 1 ? "1px solid" : "none",
                  borderColor: "rgba(200,155,60,0.4)",
                }}
              />
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {units.map((unit, i) => (
              <React.Fragment key={unit.code}>
                <TimerDigit {...unit} />
                {i < units.length - 1 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {[0, 1].map((j) => (
                      <motion.div
                        key={j}
                        className="w-1 h-1 rounded-full bg-ember-400"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: j * 0.5 }}
                        style={{ boxShadow: "0 0 6px rgba(200,155,60,0.8)" }}
                      />
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-ember-400/10">
            <div className="flex items-center gap-1.5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-ember-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ boxShadow: "0 0 6px rgba(200,155,60,0.8)" }}
              />
              <span className="font-mono text-zinc-700 text-[8px] tracking-widest uppercase">Signal actif</span>
            </div>
            <motion.span className="font-mono text-ember-600 text-[8px] tracking-widest" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
              Cégep de Saint-Félicien
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-28 sm:pb-32">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl w-full">
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 border border-ember-400/30 bg-ember-600/10 rounded-sm mb-5 sm:mb-8"
          >
            <Zap size={12} className="text-ember-300" />
            <span className="font-mono text-ember-400 text-xs tracking-[0.3em] uppercase">
              Cégep de Saint-Félicien · 9–11 Oct 2026
            </span>
            <Zap size={12} className="text-ember-300" />
          </motion.div>

          {/* Main title */}
          <motion.h1
            variants={fadeInUp}
            className="font-display font-black uppercase leading-none mb-3 sm:mb-4"
            style={{ fontSize: "clamp(2.8rem, 10vw, 9rem)" }}
          >
            <span className="block text-white tracking-tight">LAN</span>
            <motion.span
              className="block tracking-tight"
              animate={{
                backgroundImage: [
                  "linear-gradient(90deg, #C89B3C, #FFD700, #9A6E00)",
                  "linear-gradient(90deg, #FFD700, #C89B3C, #FFD700)",
                  "linear-gradient(90deg, #9A6E00, #FFD700, #C89B3C)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Gaming
            </motion.span>
            <motion.span
              className="block font-mono text-ember-300 mt-1 sm:mt-2"
              style={{ fontSize: "clamp(1.5rem, 5vw, 6rem)", letterSpacing: "clamp(0.1em, 1vw, 0.4em)" }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              2026
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="font-body text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mt-4 sm:mt-6 leading-relaxed font-light"
          >
            Trois jours d'arènes épiques, de compétitions légendaires et de fraternité gaming au cœur du Lac-Saint-Jean.
          </motion.p>

          {/* Stats row */}
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-5 sm:gap-10 md:gap-16 mt-6 sm:mt-10">
            {[
              { value: "47H", label: "DE GAMING" },
              { value: "3", label: "TOURNOIS OFFICIELS" },
              { value: "9-11", label: "OCTOBRE" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-ember-300 text-gold-glow">{value}</p>
                <p className="font-mono text-zinc-600 text-[10px] sm:text-xs tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-10">
            <Link to="/billetterie">
              <motion.button
                className="relative px-8 py-3.5 clip-diagonal overflow-hidden group"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute inset-0 bg-ember-400 transition-transform duration-300 group-hover:scale-105" />
                <motion.span className="absolute inset-0 bg-gradient-to-r from-ember-300 via-ember-200 to-ember-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative font-display font-bold text-obsidian-900 text-sm tracking-widest uppercase flex items-center gap-2">
                  <Zap size={14} />
                  Billetterie bientôt disponible
                </span>
              </motion.button>
            </Link>

            <Link to="/competitions">
              <motion.button
                className="px-8 py-3.5 border border-ember-400/40 text-ember-300 font-display font-semibold text-sm tracking-widest uppercase hover:border-ember-400 hover:bg-ember-400/5 transition-all duration-300 clip-diagonal"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex items-center gap-2">
                  <Shield size={14} />
                  Compétitions
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Countdown */}
          <motion.div variants={fadeInUp} className="mt-8">
            <FuturisticTimer />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="font-mono text-zinc-700 text-[10px] tracking-widest">SCROLL</span>
        <ChevronDown size={16} className="text-ember-600" />
      </motion.div>
    </section>
  );
}
