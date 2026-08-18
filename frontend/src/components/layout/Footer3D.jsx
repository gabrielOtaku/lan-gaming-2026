import React, { useRef, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import WebGLErrorBoundary from './WebGLErrorBoundary.jsx';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { fadeInUp, staggerContainer } from '../../utils/animations.js';

// ── Social platform data (Twitch, Instagram, TikTok, YouTube, Facebook) ──────
const SOCIALS = [
  {
    label: 'Twitch',
    url: 'https://twitch.tv/lan2026csf',
    color: '#9146FF',
    bg: 'rgba(145,70,255,0.12)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    url: 'https://instagram.com/cegepstfelicien',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.12)',
    gradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    url: 'https://tiktok.com/@lan2026csf',
    color: '#00F2EA',
    bg: 'rgba(0,242,234,0.08)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    url: 'https://youtube.com/@cstfelicien',
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    url: 'https://facebook.com/cegepstfelicien',
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.12)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

// ── CSS 3D Social Card ────────────────────────────────────────────────────────
function SocialCard3D({ social }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });
  const glowOpacity = useSpring(0, { stiffness: 200, damping: 25 });
  const scale = useSpring(1, { stiffness: 300, damping: 25 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    scale.set(1.08);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    glowOpacity.set(0);
    scale.set(1);
  };

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`LAN Gaming 2026 sur ${social.label}`}
      className="block cursor-none"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          perspective: 800,
        }}
        className="relative flex flex-col items-center gap-2 group"
      >
        {/* Card face */}
        <div
          className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border transition-all duration-300 overflow-hidden"
          style={{
            background: social.bg,
            borderColor: `${social.color}30`,
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          }}
        >
          {/* Shine sweep on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 20%, ${social.color}25 50%, transparent 80%)`,
              opacity: glowOpacity,
              translateX: useTransform(x, [-0.5, 0.5], ['-100%', '100%']),
            }}
          />

          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: `0 0 30px ${social.color}`,
              opacity: useTransform(glowOpacity, [0, 1], [0, 0.6]),
            }}
          />

          {/* Icon */}
          <motion.div
            style={{
              color: social.color,
              filter: useTransform(
                glowOpacity,
                [0, 1],
                [`drop-shadow(0 0 0px ${social.color}00)`, `drop-shadow(0 0 8px ${social.color})`]
              ),
            }}
          >
            {social.icon}
          </motion.div>

          {/* 3D depth plane */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: 'translateZ(-4px)', background: 'rgba(0,0,0,0.3)' }}
          />
        </div>

        {/* Label */}
        <motion.span
          className="font-mono text-[9px] tracking-widest uppercase transition-colors duration-300"
          style={{ color: useTransform(glowOpacity, [0, 1], ['#3f3f46', social.color]) }}
        >
          {social.label}
        </motion.span>
      </motion.div>
    </a>
  );
}

// ── Ambient 3D particles background ──────────────────────────────────────────
function AmbientParticles() {
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#C89B3C" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

function RuneRing() {
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) ringRef.current.rotation.z = state.clock.elapsedTime * 0.08;
  });
  return (
    <mesh ref={ringRef} position={[0, 0, -1]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[4, 0.006, 4, 80]} />
      <meshBasicMaterial color="#C89B3C" transparent opacity={0.1} />
    </mesh>
  );
}

// ── Main Footer ───────────────────────────────────────────────────────────────
export default function Footer3D() {
  return (
    <footer className="relative bg-obsidian-900 border-t border-ember-400/15 overflow-hidden">
      {/* Top ember line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember-400/50 to-transparent" />

      {/* 3D ambient canvas background */}
      <div className="absolute inset-0 h-40 pointer-events-none">
        <WebGLErrorBoundary>
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 2, 2]} intensity={0.6} color="#C89B3C" />
            <Suspense fallback={null}>
              <RuneRing />
              <AmbientParticles />
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
      </div>

      {/* Social cards section — CSS 3D hover */}
      <div className="relative z-10 py-10">
        <motion.p
          className="font-mono text-ember-600 text-[9px] tracking-[0.5em] uppercase text-center mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Rejoins la communauté
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-6 md:gap-10"
          style={{ perspective: 1200 }}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {SOCIALS.map((social) => (
            <motion.div key={social.label} variants={fadeInUp}>
              <SocialCard3D social={social} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom info bar */}
      <div className="border-t border-ember-400/10 relative z-10">
        <motion.div
          className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Left */}
          <motion.div variants={fadeInUp} className="text-center md:text-left">
            <p className="font-display text-ember-400 text-sm tracking-widest">LAN Gaming 2026</p>
            <p className="font-body text-zinc-600 text-xs mt-1 tracking-wide">
              Cégep de Saint-Félicien · 9-11 Oct 2026
            </p>
          </motion.div>

          {/* Center */}
          <motion.div variants={fadeInUp} className="flex items-center gap-6">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-widest text-zinc-700 hover:text-ember-300 transition-colors duration-300"
              >
                {s.label.toUpperCase()}
              </a>
            ))}
          </motion.div>

          {/* Right */}
          <motion.div variants={fadeInUp} className="text-center md:text-right">
            <p className="font-mono text-zinc-700 text-xs tracking-widest">
              © 2026 CÉGEP DE SAINT-FÉLICIEN
            </p>
            <p className="font-mono text-zinc-800 text-[10px] mt-1 tracking-widest">
              v2.0.26 · ALL RIGHTS RESERVED
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
