import React, { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import * as THREE from "three";
import WebGLErrorBoundary from "../layout/WebGLErrorBoundary.jsx";
import { EsquieModel } from "../three/GameAssets.jsx";
import { staggerContainer, fadeInUp } from "../../utils/animations.js";
import { Zap, Shield, ChevronDown } from "lucide-react";

// Shared between GSAP ScrollTrigger and the Three.js camera loop
const heroScrollProg = { current: 0 };

useGLTF.preload('/models/esquie.glb');

// ── 3D Background Grid ────────────────────────────────────────────────────────
function HoloGrid() {
  const gridRef = useRef();
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 3;
      gridRef.current.material.opacity =
        0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  const gridGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    const size = 20;
    const step = 1.5;
    for (let i = -size; i <= size; i += step) {
      vertices.push(-size, i, 0, size, i, 0);
      vertices.push(i, -size, 0, i, size, 0);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  return (
    <lineSegments
      ref={gridRef}
      geometry={gridGeometry}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, -5, -5]}
    >
      <lineBasicMaterial color="#C89B3C" transparent opacity={0.08} />
    </lineSegments>
  );
}

// ── Floating Rune Shards ──────────────────────────────────────────────────────
function RuneShard({ position, scale, color, speed }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = Math.sin(t * 0.7) * 0.5;
    meshRef.current.rotation.y = t * 0.4;
    meshRef.current.rotation.z = Math.cos(t * 0.5) * 0.3;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.7}
        wireframe
      />
    </mesh>
  );
}

// ── Central Ember Core ────────────────────────────────────────────────────────
function EmberCore() {
  const coreRef = useRef();
  const outerRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = t * -0.15;
      outerRef.current.rotation.y = t * 0.25;
    }
  });

  return (
    <group position={[0, 0, -2]}>
      <mesh ref={outerRef} scale={3}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#030508"
          emissive="#C89B3C"
          emissiveIntensity={0.08}
          distort={0.3}
          speed={1.5}
          roughness={0.8}
          transparent
          opacity={0.3}
        />
      </mesh>
      <Float speed={2} rotationIntensity={0.5}>
        <mesh ref={coreRef} scale={0.6}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#C89B3C"
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  );
}

// ── Esquie mascot — flies in on load, then settles into a cute idle pose ──────
// Esquie has no skeleton (static Sketchfab mesh), so the "pose" is the whole
// body tumbling in and settling into a gentle curious tilt, not articulated limbs.
function EsquieMascot() {
  const groupRef = useRef();
  const startRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startRef.current;
    const introDur = 2.4;

    if (t < introDur) {
      const p = Math.min(t / introDur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      groupRef.current.position.set(
        THREE.MathUtils.lerp(6.5, 3.2, ease),
        THREE.MathUtils.lerp(6, -0.3, ease),
        THREE.MathUtils.lerp(-4, 0.9, ease),
      );
      groupRef.current.rotation.set(
        0,
        THREE.MathUtils.lerp(Math.PI * 3, -0.35, ease),
        THREE.MathUtils.lerp(Math.PI * 2.2, 0.12, ease),
      );
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.08, 1, ease));
    } else {
      const idle = t - introDur;
      groupRef.current.position.x = 3.2 + Math.sin(idle * 0.6) * 0.08;
      groupRef.current.position.y = -0.3 + Math.sin(idle * 0.9) * 0.15;
      groupRef.current.position.z = 0.9;
      groupRef.current.rotation.y = -0.35 + Math.sin(idle * 0.5) * 0.12;
      groupRef.current.rotation.z = 0.12 + Math.sin(idle * 0.7) * 0.04;
      groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef}>
      <EsquieModel />
    </group>
  );
}

// ── Mouse-responsive + scroll-driven camera ────────────────────────────────────
function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    const p = heroScrollProg.current;
    // Mouse parallax fades as we scroll; scroll drives forward zoom + downward drift
    const targetX = mouse.x * 1.5 * (1 - p * 0.6);
    const targetY = mouse.y * 0.8 * (1 - p * 0.7) - p * 2.2;
    const targetZ = 7 - p * 4.5; // 7 → 2.5 as user scrolls through hero
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.position.z += (targetZ - camera.position.z) * 0.06;
    camera.lookAt(0, p * 0.6, 0);
  });
  return null;
}

// ── Ember particle field ───────────────────────────────────────────────────────
function EmberField() {
  const count = 200;
  const ref = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const goldColor = new THREE.Color("#C89B3C");
    const dimColor = new THREE.Color("#4a3000");
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const t = Math.random();
      col[i * 3] = THREE.MathUtils.lerp(dimColor.r, goldColor.r, t);
      col[i * 3 + 1] = THREE.MathUtils.lerp(dimColor.g, goldColor.g, t);
      col[i * 3 + 2] = THREE.MathUtils.lerp(dimColor.b, goldColor.b, t);
    }
    return { positions: pos, colors: col };
  }, []);

  const velocities = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        vy: 0.003 + Math.random() * 0.008,
        vx: (Math.random() - 0.5) * 0.003,
      })),
    [],
  );

  useFrame(() => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += velocities[i].vx;
      posArr[i * 3 + 1] += velocities[i].vy;
      if (posArr[i * 3 + 1] > 5) posArr[i * 3 + 1] = -5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.7}
      />
    </points>
  );
}

// ── Futuristic HUD Timer ──────────────────────────────────────────────────────
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
      {/* Code label top */}
      <span className="font-mono text-ember-600 text-[8px] tracking-[0.4em] uppercase mb-1.5">
        {code}
      </span>

      {/* Digit display */}
      <div
        className="relative flex items-center justify-center w-16 md:w-20 h-14 md:h-16 bg-obsidian-900/90 border border-ember-400/30"
        style={{
          clipPath:
            "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
          boxShadow:
            "0 0 20px rgba(200,155,60,0.15), inset 0 0 15px rgba(200,155,60,0.05)",
        }}
      >
        {/* Scan line overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ opacity: 0.12 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-6 bg-gradient-to-b from-transparent via-ember-400/30 to-transparent"
            animate={{ top: ["-40%", "120%"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 3,
            }}
          />
        </motion.div>

        {/* Corner accents */}
        <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-ember-400/50" />
        <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-ember-400/50" />
        <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-ember-400/50" />
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-ember-400/50" />

        {/* Number */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={padded}
            initial={{ y: flip ? -20 : 0, opacity: flip ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="font-mono font-black text-2xl md:text-3xl text-white relative z-10"
            style={{
              textShadow:
                "0 0 12px rgba(200,155,60,0.8), 0 0 30px rgba(200,155,60,0.3)",
              fontFeatureSettings: '"tnum"',
            }}
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Label bottom */}
      <span className="font-mono text-zinc-600 text-[9px] tracking-[0.3em] uppercase mt-1.5">
        {label}
      </span>
    </div>
  );
}

function FuturisticTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
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

    // Random glitch bursts
    const glitchInterval = setInterval(
      () => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 80);
      },
      7000 + Math.random() * 5000,
    );

    return () => {
      clearInterval(id);
      clearInterval(glitchInterval);
    };
  }, []);

  const units = [
    { value: timeLeft.days, label: "Jours", code: "D" },
    { value: timeLeft.hours, label: "Heures", code: "H" },
    { value: timeLeft.mins, label: "Min", code: "M" },
    { value: timeLeft.secs, label: "Sec", code: "S" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Outer frame */}
      <motion.div
        className="relative"
        animate={
          glitch
            ? {
                x: [0, -3, 2, -1, 0],
                filter: ["none", "hue-rotate(30deg)", "none"],
              }
            : {}
        }
        transition={{ duration: 0.08 }}
      >
        {/* Top label bar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-mono text-ember-500 text-[9px] tracking-[0.4em] uppercase">
              Compte à rebours
            </span>
          </div>
          <span className="font-mono text-zinc-700 text-[9px] tracking-widest">
            LAN_2026 · OCT_9_10_11
          </span>
        </div>

        {/* Main timer panel */}
        <div
          className="relative bg-obsidian-900/80 backdrop-blur-md border border-ember-400/20 px-4 py-4"
          style={{
            clipPath:
              "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
            boxShadow:
              "0 0 40px rgba(200,155,60,0.08), inset 0 0 40px rgba(3,5,8,0.6)",
          }}
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              boxShadow: [
                "inset 0 0 20px rgba(200,155,60,0.05)",
                "inset 0 0 40px rgba(200,155,60,0.12)",
                "inset 0 0 20px rgba(200,155,60,0.05)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Corner runes */}
          {[
            "top-1 left-1",
            "top-1 right-1",
            "bottom-1 left-1",
            "bottom-1 right-1",
          ].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-3 h-3`}>
              <div
                className="w-full h-full border-ember-400/40"
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

          {/* Digits row */}
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
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: j * 0.5,
                        }}
                        style={{ boxShadow: "0 0 6px rgba(200,155,60,0.8)" }}
                      />
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-ember-400/10">
            <div className="flex items-center gap-1.5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-ember-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ boxShadow: "0 0 6px rgba(200,155,60,0.8)" }}
              />
              <span className="font-mono text-zinc-700 text-[8px] tracking-widest uppercase">
                Signal actif
              </span>
            </div>
            <motion.span
              className="font-mono text-ember-600 text-[8px] tracking-widest"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Cégep de Saint-Félicien
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function HeroCanvas() {
  const sectionRef = useRef();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
        onUpdate: (self) => {
          heroScrollProg.current = self.progress;
        },
      });
    });
    return () => {
      ctx.revert();
      heroScrollProg.current = 0;
    };
  }, []);

  const shards = useMemo(
    () => [
      { position: [-4, 2, -3], scale: 0.3, color: "#C89B3C", speed: 0.8 },
      { position: [4.5, -1, -2], scale: 0.2, color: "#FFD700", speed: 1.1 },
      { position: [-3, -2, -1], scale: 0.15, color: "#FF4655", speed: 0.6 },
      { position: [3, 2.5, -4], scale: 0.25, color: "#4FC3F7", speed: 0.9 },
      { position: [6, 0, -3], scale: 0.18, color: "#C89B3C", speed: 1.3 },
      { position: [-6, 1, -2], scale: 0.22, color: "#7C3AED", speed: 0.7 },
    ],
    [],
  );

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0">
        <WebGLErrorBoundary
          fallback={
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, #030508 0%, #07090F 60%, #0D1117 100%)" }}
            />
          }
        >
        <Canvas
          camera={{ position: [0, 0, 7], fov: 65 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 1.5]}
          style={{
            background:
              "linear-gradient(180deg, #030508 0%, #07090F 60%, #0D1117 100%)",
          }}
        >
          <ambientLight intensity={0.1} />
          <pointLight position={[0, 0, 3]} intensity={2} color="#C89B3C" />
          <pointLight position={[-5, 3, 0]} intensity={0.5} color="#FF4655" />
          <pointLight position={[5, -3, 0]} intensity={0.5} color="#4FC3F7" />
          <pointLight position={[3.5, 0.5, 2.5]} intensity={2.2} color="#FFE9A0" distance={6} decay={2} />

          <Suspense fallback={null}>
            <CameraRig />
            <HoloGrid />
            <EmberCore />
            <EmberField />
            <EsquieMascot />
            <Stars
              radius={80}
              depth={30}
              count={2000}
              factor={3}
              saturation={0.1}
              fade
              speed={0.5}
            />
            {shards.map((s, i) => (
              <RuneShard key={i} {...s} />
            ))}
          </Suspense>

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.25}
              luminanceSmoothing={0.9}
              intensity={1.5}
              radius={0.75}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.002, 0.002]}
              radialModulation
              modulationOffset={0.45}
            />
          </EffectComposer>
        </Canvas>
        </WebGLErrorBoundary>
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-blood-vignette pointer-events-none" />

      {/* Bottom fade — z-0 so it stays BELOW the z-10 content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian-900 to-transparent pointer-events-none z-0" />

      {/* Hero content */}
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 pb-28 sm:pb-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-5xl w-full"
        >
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
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Gaming
            </motion.span>
            <motion.span
              className="block font-mono text-ember-300 mt-1 sm:mt-2"
              style={{
                fontSize: "clamp(1.5rem, 5vw, 6rem)",
                letterSpacing: "clamp(0.1em, 1vw, 0.4em)",
              }}
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
            Trois jours d'arènes épiques, de compétitions légendaires et de
            fraternité gaming au cœur du Lac-Saint-Jean.
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-5 sm:gap-10 md:gap-16 mt-6 sm:mt-10"
          >
            {[
              { value: "47H", label: "DE GAMING" },
              { value: "150+", label: "PARTICIPANTS" },
              { value: "6", label: "TOURNOIS" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-ember-300 text-gold-glow">
                  {value}
                </p>
                <p className="font-mono text-zinc-600 text-[10px] sm:text-xs tracking-widest mt-1">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-10"
          >
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
                  Obtenir mes billets
                </span>
              </motion.button>
            </Link>

            <Link to="/calendrier">
              <motion.button
                className="px-8 py-3.5 border border-ember-400/40 text-ember-300 font-display font-semibold text-sm tracking-widest uppercase hover:border-ember-400 hover:bg-ember-400/5 transition-all duration-300 clip-diagonal"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex items-center gap-2">
                  <Shield size={14} />
                  Programme
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* ── Countdown Timer — placed BELOW CTA buttons in flow ── */}
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
        <span className="font-mono text-zinc-700 text-[10px] tracking-widest">
          SCROLL
        </span>
        <ChevronDown size={16} className="text-ember-600" />
      </motion.div>
    </section>
  );
}
