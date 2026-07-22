import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { ShoppingCart, X, Plus, Minus, Check, Package, Truck, Star, ChevronRight, Tag, ShoppingBag } from 'lucide-react';
import { pageTransition, staggerContainer, fadeInUp, scrollReveal, EASE_GAME } from '../utils/animations.js';
import WebGLErrorBoundary from '../components/layout/WebGLErrorBoundary.jsx';

// ── Catalogue produits ────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1, category: 'Vêtements', name: 'T-Shirt Officiel LAN Gaming 2026',
    price: 30, image: 'https://picsum.photos/seed/merch-tshirt/500/500',
    badge: 'Best-seller', badgeColor: '#C89B3C',
    description: 'T-shirt unisexe noir premium, sérigraphie or dorée. 100% coton ring-spun 180g.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], color: '#C89B3C', available: true,
  },
  {
    id: 2, category: 'Vêtements', name: 'Hoodie Champion LAN 2026',
    price: 55, image: 'https://picsum.photos/seed/merch-hoodie/500/500',
    badge: 'Limité', badgeColor: '#FF4655',
    description: 'Hoodie zip noir premium, broderie or sur la poitrine. Coton/polyester 320g, poche avant.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], color: '#C89B3C', available: true,
  },
  {
    id: 3, category: 'Vêtements', name: 'Casquette Officielle LAN 2026',
    price: 25, image: 'https://picsum.photos/seed/merch-cap/500/500',
    badge: null, badgeColor: null,
    description: 'Snapback ajustable noire, logo LG brodé en or, fermeture classique.',
    sizes: ['Unique'], color: '#4FC3F7', available: true,
  },
  {
    id: 4, category: 'Vêtements', name: 'Jersey Équipe LAN 2026',
    price: 45, image: 'https://picsum.photos/seed/merch-jersey/500/500',
    badge: 'Exclusif', badgeColor: '#7C3AED',
    description: 'Jersey esport sublimé, coupe athlétique. Tissu respirant. Personnalisation possible (prénom + numéro).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], color: '#7C3AED', available: true,
  },
  {
    id: 5, category: 'Accessoires', name: 'Mousepad XL LAN Gaming 2026',
    price: 40, image: 'https://picsum.photos/seed/merch-pad/500/500',
    badge: 'Gaming', badgeColor: '#4FC3F7',
    description: 'Tapis de souris XL 90×40cm, base antidérapante, bords cousus, design exclusif LAN 2026.',
    sizes: ['90×40cm'], color: '#4FC3F7', available: true,
  },
  {
    id: 6, category: 'Accessoires', name: 'Pack Stickers Officiel (×12)',
    price: 12, image: 'https://picsum.photos/seed/merch-stickers/500/500',
    badge: null, badgeColor: null,
    description: 'Pack de 12 stickers vinyle imperméables aux couleurs de LAN Gaming 2026 et des tournois.',
    sizes: ['Pack ×12'], color: '#C89B3C', available: true,
  },
  {
    id: 7, category: 'Accessoires', name: 'Poster Officiel A2 (Art Print)',
    price: 18, image: 'https://picsum.photos/seed/merch-poster/500/500',
    badge: null, badgeColor: null,
    description: 'Poster A2 (42×59cm) sur papier mat 300g. Visuel exclusif LAN Gaming 2026. Numéroté.',
    sizes: ['A2 (42×59cm)'], color: '#FFD700', available: true,
  },
  {
    id: 8, category: 'Accessoires', name: 'Bracelet Tissu LAN 2026',
    price: 8, image: 'https://picsum.photos/seed/merch-bracelet/500/500',
    badge: null, badgeColor: null,
    description: "Bracelet tissu officiel, couleurs or/noir, logo tissé. Port recommandé pendant l'événement.",
    sizes: ['Unique'], color: '#C89B3C', available: true,
  },
  {
    id: 9, category: 'Packs', name: 'Pack Fondateur — Complet',
    price: 95, image: 'https://picsum.photos/seed/merch-pack1/500/500',
    badge: '🔥 Meilleur prix', badgeColor: '#C89B3C',
    description: 'T-shirt + Hoodie + Casquette + Bracelet + Pack Stickers. Économise 25$ vs l\'achat séparé.',
    sizes: ['S', 'M', 'L', 'XL'], color: '#FFD700', available: true,
  },
  {
    id: 10, category: 'Packs', name: 'Pack Compétiteur Elite',
    price: 70, image: 'https://picsum.photos/seed/merch-pack2/500/500',
    badge: 'Exclusif', badgeColor: '#FF4655',
    description: 'Jersey personnalisé + Mousepad XL + Poster + Bracelet. Le setup complet pour les compétiteurs.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], color: '#FF4655', available: true,
  },
  {
    id: 11, category: 'Packs', name: 'Pack Cadeau LAN 2026',
    price: 50, image: 'https://picsum.photos/seed/merch-pack3/500/500',
    badge: 'Idée cadeau', badgeColor: '#4FC3F7',
    description: 'T-shirt + Casquette + Pack Stickers + Poster. Parfait pour un cadeau à un passionné de gaming.',
    sizes: ['S', 'M', 'L', 'XL'], color: '#4FC3F7', available: true,
  },
  {
    id: 12, category: 'Partenaires', name: 'Carte-Cadeau Metro (20$)',
    price: 20, image: 'https://picsum.photos/seed/merch-metro/500/500',
    badge: 'Metro', badgeColor: '#E31837',
    description: 'Carte-cadeau Metro offerte par notre partenaire Diamant. Valable dans tous les Metro du Québec.',
    sizes: ['20$'], color: '#E31837', available: true,
  },
  {
    id: 13, category: 'Partenaires', name: 'Bundle Gaming — Centre Hi-Fi',
    price: 0, image: 'https://picsum.photos/seed/merch-hifi/500/500',
    badge: 'En magasin', badgeColor: '#0057A8',
    description: 'Offres exclusives sur les périphériques gaming disponibles chez Centre Hi-Fi pour les participants LAN 2026.',
    sizes: ['Voir en magasin'], color: '#0057A8', available: false,
  },
];

const CATEGORIES = ['Tous', 'Vêtements', 'Accessoires', 'Packs', 'Partenaires'];

const SHIPPING_INFO = [
  { icon: Truck,   text: "Livraison sur place ou avant l'événement", color: '#22c55e' },
  { icon: Package, text: 'Commandes disponibles jusqu\'au 30 sept. 2026', color: '#C89B3C' },
  { icon: Star,    text: 'Produits officiels — qualité certifiée', color: '#FFD700' },
];

// ── Vecteurs réutilisables (évite la GC dans useFrame) ───────────────────────
const _up  = new THREE.Vector3(0, 1, 0);
const _vel = new THREE.Vector3();

// ── Manette de jeu 3D ────────────────────────────────────────────────────────
function Controller() {
  const bodyRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.rotation.y = Math.sin(t * 0.22) * 0.35;
      bodyRef.current.rotation.x = Math.sin(t * 0.17) * 0.12 - 0.08;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.05} floatIntensity={0.7}>
      <group ref={bodyRef} scale={1.05}>
        {/* ── Corps principal ── */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[2.7, 0.55, 1.15]} />
          <meshStandardMaterial color="#0A0D14" roughness={0.18} metalness={0.85} emissive="#C89B3C" emissiveIntensity={0.07} />
        </mesh>

        {/* ── Poignée gauche ── */}
        <mesh position={[-0.88, -0.82, 0]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.78, 1.35, 0.9]} />
          <meshStandardMaterial color="#090C12" roughness={0.22} metalness={0.8} />
        </mesh>

        {/* ── Poignée droite ── */}
        <mesh position={[0.88, -0.82, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.78, 1.35, 0.9]} />
          <meshStandardMaterial color="#090C12" roughness={0.22} metalness={0.8} />
        </mesh>

        {/* ── Gâchette gauche (L1) ── */}
        <mesh position={[-0.82, 0.38, 0.38]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.6, 0.14, 0.38]} />
          <meshStandardMaterial color="#C89B3C" roughness={0.1} metalness={0.95} emissive="#C89B3C" emissiveIntensity={0.4} />
        </mesh>

        {/* ── Gâchette droite (R1) ── */}
        <mesh position={[0.82, 0.38, 0.38]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.6, 0.14, 0.38]} />
          <meshStandardMaterial color="#C89B3C" roughness={0.1} metalness={0.95} emissive="#C89B3C" emissiveIntensity={0.4} />
        </mesh>

        {/* ── D-pad horizontal ── */}
        <mesh position={[-0.72, 0.06, 0.55]}>
          <boxGeometry args={[0.38, 0.08, 0.11]} />
          <meshStandardMaterial color="#141820" roughness={0.5} />
        </mesh>
        {/* ── D-pad vertical ── */}
        <mesh position={[-0.72, 0.06, 0.55]}>
          <boxGeometry args={[0.11, 0.08, 0.38]} />
          <meshStandardMaterial color="#141820" roughness={0.5} />
        </mesh>

        {/* ── Boutons ABXY ── */}
        {[
          { pos: [0.88,  0.01, 0.55], color: '#22c55e' },
          { pos: [1.02,  0.12, 0.49], color: '#ef4444' },
          { pos: [0.74,  0.12, 0.49], color: '#3b82f6' },
          { pos: [0.88,  0.22, 0.49], color: '#eab308' },
        ].map(({ pos, color }, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.15} />
          </mesh>
        ))}

        {/* ── Stick analogique gauche ── */}
        <mesh position={[-0.32, -0.1, 0.56]}>
          <cylinderGeometry args={[0.13, 0.1, 0.07, 14]} />
          <meshStandardMaterial color="#111418" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* ── Stick analogique droit ── */}
        <mesh position={[0.38, -0.28, 0.56]}>
          <cylinderGeometry args={[0.13, 0.1, 0.07, 14]} />
          <meshStandardMaterial color="#111418" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* ── LED centrale dorée ── */}
        <mesh position={[0, 0.18, 0.56]}>
          <boxGeometry args={[0.22, 0.05, 0.04]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={5} />
        </mesh>

        {/* ── Boutons start/select ── */}
        <mesh position={[-0.22, 0.15, 0.56]}>
          <boxGeometry args={[0.1, 0.04, 0.04]} />
          <meshStandardMaterial color="#1e2230" roughness={0.4} />
        </mesh>
        <mesh position={[0.22, 0.15, 0.56]}>
          <boxGeometry args={[0.1, 0.04, 0.04]} />
          <meshStandardMaterial color="#1e2230" roughness={0.4} />
        </mesh>

        {/* ── Reflet bord avant ── */}
        <mesh position={[0, 0.05, 0.58]}>
          <boxGeometry args={[2.5, 0.44, 0.015]} />
          <meshStandardMaterial color="#C89B3C" roughness={0.05} metalness={1} emissive="#C89B3C" emissiveIntensity={0.15} transparent opacity={0.45} />
        </mesh>
      </group>
    </Float>
  );
}

// ── Comète orbitale ───────────────────────────────────────────────────────────
function Comet({ radius, speed, phaseOffset, inclinationX, inclinationY, color, size = 1 }) {
  const groupRef = useRef();

  useFrame((state) => {
    const a = state.clock.elapsedTime * speed + phaseOffset;
    const cX = Math.cos(inclinationX);
    const sX = Math.sin(inclinationX);
    const cY = Math.cos(inclinationY);
    const sY = Math.sin(inclinationY);

    // Position sur l'orbite inclinée
    const x = Math.cos(a) * radius * cY - Math.sin(a) * radius * sY * sX;
    const y = Math.sin(a) * radius * cX;
    const z = Math.cos(a) * radius * sY + Math.sin(a) * radius * cY * sX;

    if (!groupRef.current) return;
    groupRef.current.position.set(x, y, z);

    // Direction de la vitesse (tangente à l'orbite)
    const vx = (-Math.sin(a) * cY - Math.cos(a) * sY * sX);
    const vy = (Math.cos(a) * cX);
    const vz = (-Math.sin(a) * sY + Math.cos(a) * cY * sX);
    const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
    _vel.set(vx / len, vy / len, vz / len);

    // Orienter le groupe : axe +Y local = direction de la vitesse
    groupRef.current.quaternion.setFromUnitVectors(_up, _vel);
  });

  const tailLen = 0.9 * size;

  return (
    <group ref={groupRef}>
      {/* Tête — noyau blanc */}
      <mesh>
        <sphereGeometry args={[0.055 * size, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={8} />
      </mesh>
      {/* Tête — halo coloré */}
      <mesh>
        <sphereGeometry args={[0.1 * size, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.7} />
      </mesh>
      {/* Queue extérieure — cône translucide (pointe en 0,0,0 ; base vers -Y) */}
      <mesh position={[0, -(tailLen / 2), 0]}>
        <coneGeometry args={[0.07 * size, tailLen, 8, 1, true]} />
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={1.5}
          transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Queue intérieure — trait brillant */}
      <mesh position={[0, -(tailLen * 0.28), 0]}>
        <coneGeometry args={[0.022 * size, tailLen * 0.55, 6, 1, true]} />
        <meshStandardMaterial
          color="#ffffff" emissive="#ffffff" emissiveIntensity={4}
          transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ── Lucioles (canvas 2D, overlay pleine page) ─────────────────────────────────
function FireflyCanvas() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const PALETTE = [
      [200, 155, 60],   // ember
      [255, 215, 0],    // gold
      [79,  195, 247],  // cyan
      [200, 155, 60],   // ember (poids doublé)
      [255, 215, 0],    // gold  (poids doublé)
    ];

    const flies = Array.from({ length: 55 }, () => {
      const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        x:          Math.random() * window.innerWidth,
        y:          Math.random() * window.innerHeight,
        vx:         (Math.random() - 0.5) * 0.45,
        vy:         (Math.random() - 0.5) * 0.45,
        radius:     1.2 + Math.random() * 2.0,
        alpha:      Math.random(),
        alphaDir:   Math.random() > 0.5 ? 1 : -1,
        alphaSpeed: 0.004 + Math.random() * 0.012,
        col,
      };
    });

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const f of flies) {
        // Déplacement avec légère dérive aléatoire
        f.vx += (Math.random() - 0.5) * 0.025;
        f.vy += (Math.random() - 0.5) * 0.025;
        f.vx  = Math.max(-0.7, Math.min(0.7, f.vx));
        f.vy  = Math.max(-0.7, Math.min(0.7, f.vy));
        f.x  += f.vx;
        f.y  += f.vy;

        // Rebond sur les bords
        if (f.x < 0)             f.x = canvas.width;
        if (f.x > canvas.width)  f.x = 0;
        if (f.y < 0)             f.y = canvas.height;
        if (f.y > canvas.height) f.y = 0;

        // Scintillement
        f.alpha += f.alphaDir * f.alphaSpeed;
        if (f.alpha >= 1) { f.alpha = 1; f.alphaDir = -1; }
        if (f.alpha <= 0) { f.alpha = 0; f.alphaDir = 1; }

        // Dessin avec dégradé radial
        const glow = f.radius * 6;
        const [r, g, b] = f.col;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glow);
        grad.addColorStop(0,    `rgba(${r},${g},${b},${f.alpha})`);
        grad.addColorStop(0.25, `rgba(${r},${g},${b},${(f.alpha * 0.55).toFixed(3)})`);
        grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, glow, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}

// ── Scène hero 3D (manette + comètes) ────────────────────────────────────────
function BoutiqueHero3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <WebGLErrorBoundary>
      <Canvas camera={{ position: [0, 0.3, 7.5], fov: 58 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <ambientLight intensity={0.12} />
        <pointLight position={[3, 2, 3]}   intensity={2.5} color="#C89B3C" />
        <pointLight position={[-3, -1, 2]} intensity={1.0} color="#4FC3F7" />
        <pointLight position={[0, 3, -2]}  intensity={0.6} color="#FFD700" />
        <Suspense fallback={null}>
          <Stars radius={55} depth={20} count={500} factor={1.8} saturation={0} fade speed={0.3} />
          <Controller />
          <Comet radius={3.2} speed={0.55} phaseOffset={0}           inclinationX={0.4}  inclinationY={0.2}  color="#C89B3C" size={1.1} />
          <Comet radius={3.8} speed={0.38} phaseOffset={Math.PI}     inclinationX={1.1}  inclinationY={0.9}  color="#FFD700" size={0.9} />
          <Comet radius={2.9} speed={0.72} phaseOffset={Math.PI / 2} inclinationX={0.2}  inclinationY={1.5}  color="#4FC3F7" size={0.8} />
          <Comet radius={4.2} speed={0.30} phaseOffset={2.4}         inclinationX={1.8}  inclinationY={0.5}  color="#FF4655" size={1.0} />
          <Comet radius={3.5} speed={0.62} phaseOffset={4.0}         inclinationX={0.7}  inclinationY={2.1}  color="#7C3AED" size={0.75} />
          <Comet radius={2.6} speed={0.88} phaseOffset={1.2}         inclinationX={2.3}  inclinationY={1.2}  color="#C89B3C" size={0.65} />
        </Suspense>
      </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}

// ── Cart FAB — bouton panier amélioré ─────────────────────────────────────────
function CartFab({ cartCount, cartTotal, onClick }) {
  const prevCount = useRef(cartCount);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-24 right-5 z-[900] flex flex-col items-center gap-0.5 group"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
    >
      {/* Main hexagon FAB */}
      <motion.div
        className="relative w-16 h-16 flex items-center justify-center"
        animate={burst
          ? { scale: [1, 1.25, 0.9, 1.12, 1], rotate: [0, -8, 8, -4, 0] }
          : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {/* Animated background glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: cartCount > 0
              ? [
                  '0 0 0px 0px rgba(200,155,60,0)',
                  '0 0 20px 6px rgba(200,155,60,0.5)',
                  '0 0 30px 10px rgba(255,215,0,0.35)',
                  '0 0 20px 6px rgba(200,155,60,0.5)',
                  '0 0 0px 0px rgba(200,155,60,0)',
                ]
              : '0 0 20px 4px rgba(200,155,60,0.25)',
          }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)' }}
        />

        {/* Hex body */}
        <div
          className="w-full h-full flex items-center justify-center relative overflow-hidden"
          style={{
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
            background: cartCount > 0
              ? 'linear-gradient(135deg, #C89B3C, #FFD700)'
              : 'linear-gradient(135deg, #C89B3C, #B8883A)',
          }}
        >
          {/* Inner shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <ShoppingCart size={22} className="text-obsidian-900 relative z-10" strokeWidth={2.5} />
        </div>

        {/* Badge count */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              key={cartCount}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] rounded-full bg-red-500 border-2 border-obsidian-900 flex items-center justify-center px-1"
            >
              <span className="font-mono font-black text-white leading-none" style={{ fontSize: 10 }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Total sous le FAB — visible si panier non vide */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.85 }}
            className="bg-obsidian-800 border border-ember-400/30 px-2 py-0.5 rounded-sm"
          >
            <span className="font-display font-black text-ember-300 leading-none" style={{ fontSize: 11 }}>
              {cartTotal}$
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onQuickView }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!product.available) return;
    setAdded(true);
    onAddToCart(product, product.sizes[0]);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE_GAME }}
      className="group cursor-pointer"
      onClick={() => onQuickView(product)}
    >
      <div
        className="relative bg-obsidian-800 border border-zinc-800 group-hover:border-zinc-600 transition-all duration-300 overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-obsidian-700">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-obsidian-900/40 group-hover:bg-transparent transition-colors duration-300" />

          {product.badge && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase font-bold"
              style={{ background: `${product.badgeColor}20`, border: `1px solid ${product.badgeColor}50`, color: product.badgeColor }}
            >
              {product.badge}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-obsidian-900/80 backdrop-blur-sm px-3 py-1.5 border border-zinc-700">
              <span className="font-mono text-zinc-300 text-[10px] tracking-widest uppercase">Vue rapide →</span>
            </div>
          </div>

          {!product.available && (
            <div className="absolute inset-0 bg-obsidian-900/80 flex items-center justify-center">
              <span className="font-mono text-zinc-500 text-xs tracking-widest uppercase">Non disponible en ligne</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-mono text-zinc-600 text-[9px] tracking-[0.4em] uppercase mb-1">{product.category}</p>
          <h3 className="font-display text-white text-sm font-bold leading-snug mb-3 group-hover:text-ember-200 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-black text-lg" style={{ color: product.color }}>
              {product.price === 0 ? 'Gratuit' : `${product.price}$`}
            </span>

            <motion.button
              onClick={handleAdd}
              disabled={!product.available}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all duration-200 border ${
                added
                  ? 'border-green-500/50 bg-green-500/15 text-green-400'
                  : product.available
                  ? 'border-ember-400/40 bg-ember-400/10 text-ember-300 hover:border-ember-400 hover:bg-ember-400/20'
                  : 'border-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              whileTap={{ scale: product.available ? 0.95 : 1 }}
            >
              {added ? <Check size={11} /> : <ShoppingCart size={11} />}
              {added ? 'Ajouté !' : product.available ? 'Ajouter' : 'En magasin'}
            </motion.button>
          </div>
        </div>

        <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-ember-400/60 to-transparent transition-all duration-500" />
      </div>
    </motion.div>
  );
}

// ── Quick View Modal ──────────────────────────────────────────────────────────
function QuickViewModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product.available) return;
    onAddToCart(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-obsidian-900/90 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl bg-obsidian-800 border border-zinc-700 shadow-[0_0_80px_rgba(200,155,60,0.15)] overflow-hidden"
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-zinc-600 hover:text-ember-300 transition-colors p-1">
          <X size={20} />
        </button>

        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-square sm:aspect-auto bg-obsidian-700 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.badge && (
              <div className="absolute top-4 left-4 px-3 py-1 font-mono text-[10px] tracking-widest uppercase font-bold"
                style={{ background: `${product.badgeColor}25`, border: `1px solid ${product.badgeColor}60`, color: product.badgeColor }}>
                {product.badge}
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="font-mono text-zinc-600 text-[9px] tracking-[0.4em] uppercase mb-1">{product.category}</p>
              <h2 className="font-display text-xl font-black text-white leading-tight">{product.name}</h2>
              <p className="font-display font-black text-2xl mt-2" style={{ color: product.color }}>
                {product.price === 0 ? 'Gratuit' : `${product.price}$`}
              </p>
            </div>

            <p className="font-body text-zinc-400 text-sm leading-relaxed">{product.description}</p>

            {product.sizes.length > 1 && (
              <div>
                <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mb-2">Taille</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 font-mono text-xs border transition-all ${
                        selectedSize === size
                          ? 'border-ember-400 bg-ember-400/15 text-ember-300'
                          : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.available && (
              <div>
                <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mb-2">Quantité</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="font-mono text-white text-sm w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(5, quantity + 1))} className="w-8 h-8 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}

            <motion.button
              onClick={handleAdd}
              disabled={!product.available}
              className={`w-full py-3.5 clip-diagonal font-display font-bold text-sm tracking-widest uppercase transition-colors ${
                added
                  ? 'bg-green-500 text-white'
                  : product.available
                  ? 'bg-ember-400 hover:bg-ember-300 text-obsidian-900'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              whileTap={{ scale: product.available ? 0.98 : 1 }}
            >
              {added
                ? '✓ Ajouté au panier!'
                : product.available
                ? `Ajouter au panier — ${product.price === 0 ? 'Gratuit' : `${product.price * quantity}$`}`
                : 'Disponible en magasin uniquement'}
            </motion.button>

            {product.available && (
              <p className="font-mono text-zinc-700 text-[9px] tracking-widest text-center">
                Commande par courriel · Remise sur place à l'événement
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Cart Drawer ────────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onUpdateQty }) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'form' | 'success'
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState(null);
  const [sending, setSending] = useState(false);

  const handleCheckout = async () => {
    if (checkoutStep === 'cart') { setCheckoutStep('form'); return; }
    if (!formName.trim() || !formEmail.trim()) { setFormError('Nom et courriel requis.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) { setFormError('Courriel invalide.'); return; }
    setSending(true); setFormError(null);
    try {
      const items = cart.map(i => ({
        name: i.product.name, size: i.size, qty: i.qty, subtotal: i.product.price * i.qty,
      }));
      const res = await fetch('/api/boutique/commande', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim(), email: formEmail.trim(), items, total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur.');
      setCheckoutStep('success');
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[2500] flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-obsidian-900/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-sm bg-obsidian-800 border-l border-ember-400/20 flex flex-col h-full"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ember-400/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 clip-hex bg-ember-400/20 border border-ember-400/40 flex items-center justify-center">
              <ShoppingBag size={14} className="text-ember-300" />
            </div>
            <div>
              <p className="font-display text-ember-300 font-bold tracking-widest text-sm">Panier</p>
              <p className="font-mono text-zinc-600 text-[9px] tracking-widest mt-0.5">
                {count} article{count !== 1 ? 's' : ''} · {total}$
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-ember-300 transition-colors"><X size={18} /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="font-mono text-zinc-600 text-xs tracking-widest">Panier vide</p>
              <p className="font-body text-zinc-700 text-xs mt-2">Ajoute des produits depuis la boutique</p>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-3 border border-zinc-800 p-3 bg-obsidian-900/50"
              >
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover flex-shrink-0 filter grayscale" />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-white text-xs font-bold leading-snug truncate">{item.product.name}</p>
                  <p className="font-mono text-zinc-600 text-[9px] tracking-wide mt-0.5">{item.size}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onUpdateQty(item.product.id, item.size, item.qty - 1)}
                        className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-ember-400/50 text-xs transition-colors">−</button>
                      <span className="font-mono text-white text-xs w-5 text-center">{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.product.id, item.size, item.qty + 1)}
                        className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-ember-400/50 text-xs transition-colors">+</button>
                    </div>
                    <span className="font-display font-bold text-ember-300 text-sm">{item.product.price * item.qty}$</span>
                  </div>
                </div>
                <button onClick={() => onRemove(item.product.id, item.size)} className="text-zinc-700 hover:text-red-400 transition-colors self-start p-0.5">
                  <X size={13} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && checkoutStep !== 'success' && (
          <div className="p-5 border-t border-ember-400/10">
            {checkoutStep === 'cart' && (
              <>
                <div className="space-y-1.5 mb-4">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}-sub`} className="flex justify-between">
                      <span className="font-mono text-zinc-600 text-[9px] truncate max-w-[160px]">
                        {item.product.name} ×{item.qty}
                      </span>
                      <span className="font-mono text-zinc-500 text-[9px]">{item.product.price * item.qty}$</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-4 pt-3 border-t border-zinc-800">
                  <span className="font-mono text-zinc-400 text-sm tracking-widest uppercase">Total</span>
                  <span className="font-display font-black text-ember-300 text-2xl">{total}$</span>
                </div>
              </>
            )}

            {checkoutStep === 'form' && (
              <div className="mb-4 space-y-3">
                <p className="font-mono text-ember-500 text-[9px] tracking-widest uppercase mb-2">
                  Coordonnées — confirmation par courriel
                </p>
                <input
                  type="text" placeholder="Ton nom" value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white font-mono text-xs px-3 py-2.5 outline-none transition-colors"
                />
                <input
                  type="email" placeholder="Ton courriel" value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white font-mono text-xs px-3 py-2.5 outline-none transition-colors"
                />
                {formError && (
                  <p className="font-mono text-red-400 text-[10px]">{formError}</p>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <span className="font-mono text-zinc-400 text-xs">Total</span>
                  <span className="font-display font-black text-ember-300 text-xl">{total}$</span>
                </div>
              </div>
            )}

            <motion.button
              onClick={handleCheckout}
              disabled={sending}
              className="w-full py-3.5 clip-diagonal bg-ember-400 hover:bg-ember-300 disabled:opacity-60 text-obsidian-900 font-display font-bold text-sm tracking-widest uppercase transition-colors"
              whileTap={{ scale: 0.98 }}
              animate={{ boxShadow: ['0 0 15px rgba(200,155,60,0.3)', '0 0 35px rgba(255,215,0,0.55)', '0 0 15px rgba(200,155,60,0.3)'] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              {sending ? 'Envoi...' : checkoutStep === 'cart' ? 'Commander →' : 'Confirmer la commande →'}
            </motion.button>
            {checkoutStep === 'cart' && (
              <p className="font-mono text-zinc-700 text-[9px] tracking-widest text-center mt-3">
                Remise sur place · Paiement à l'événement
              </p>
            )}
            {checkoutStep === 'form' && (
              <button onClick={() => setCheckoutStep('cart')} className="w-full mt-2 font-mono text-zinc-700 hover:text-zinc-500 text-[9px] tracking-widest text-center transition-colors">
                ← Retour au panier
              </button>
            )}
          </div>
        )}

        {/* Success state */}
        {checkoutStep === 'success' && (
          <div className="p-8 text-center border-t border-ember-400/10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
              className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-green-400" />
            </motion.div>
            <p className="font-display font-bold text-white text-sm mb-1">Commande envoyée !</p>
            <p className="font-mono text-zinc-600 text-[10px] leading-relaxed">
              Un courriel de confirmation a été envoyé à <span className="text-ember-400">{formEmail}</span>.<br />
              Tu récupères tes articles sur place lors de l'événement.
            </p>
            <button onClick={onClose} className="mt-5 font-mono text-ember-400 hover:text-ember-300 text-xs tracking-widest transition-colors">
              Fermer →
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BoutiquePage() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const filtered = activeCategory === 'Tous' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

  const addToCart = (product, size, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) return prev.map((i) => i.product.id === product.id && i.size === size ? { ...i, qty: Math.min(5, i.qty + qty) } : i);
      return [...prev, { product, size, qty }];
    });
  };

  const removeFromCart = (id, size) => setCart((prev) => prev.filter((i) => !(i.product.id === id && i.size === size)));

  const updateQty = (id, size, qty) => {
    if (qty <= 0) { removeFromCart(id, size); return; }
    setCart((prev) => prev.map((i) => i.product.id === id && i.size === size ? { ...i, qty: Math.min(5, qty) } : i));
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen pb-20 relative overflow-hidden">

      {/* Lucioles pleine page */}
      <FireflyCanvas />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <div className="absolute inset-0 opacity-[0.012]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(200,155,60,0.4) 50px, rgba(200,155,60,0.4) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(200,155,60,0.4) 50px, rgba(200,155,60,0.4) 51px)' }}
        />
      </div>

      {/* ── Hero 3D ─────────────────────────────────────────────────────────── */}
      <div className="relative h-72 md:h-96 flex items-end overflow-hidden">
        <BoutiqueHero3D />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900/40 via-transparent to-obsidian-900" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-10">
          <motion.p
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            [ Boutique officielle ]
          </motion.p>
          <motion.h1
            className="font-display text-5xl md:text-7xl font-black uppercase leading-none"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
          >
            <span className="text-white">Merch</span>{' '}
            <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}>
              LAN 2026
            </span>
          </motion.h1>
          <motion.div
            className="flex items-center gap-4 mt-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          >
            <div className="h-px w-12 bg-ember-400" />
            <p className="font-body text-zinc-500 text-sm">Collection officielle · Livraison sur place à l'événement</p>
          </motion.div>
        </div>
      </div>

      {/* Cart FAB amélioré */}
      <CartFab cartCount={cartCount} cartTotal={cartTotal} onClick={() => setCartOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">

        {/* Shipping info */}
        <motion.div
          variants={staggerContainer} initial="hidden" animate="visible"
          className="flex flex-wrap items-center justify-center gap-6 mb-10"
        >
          {SHIPPING_INFO.map(({ icon: Icon, text, color }) => (
            <motion.div key={text} variants={fadeInUp} className="flex items-center gap-2">
              <Icon size={13} style={{ color }} />
              <span className="font-mono text-zinc-500 text-[10px] tracking-wide">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Category tabs */}
        <motion.div
          variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200 ${
                activeCategory === cat
                  ? 'border-ember-400 bg-ember-400/10 text-ember-300'
                  : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
              {cat !== 'Tous' && (
                <span className="ml-1.5 text-zinc-700">({PRODUCTS.filter((p) => p.category === cat).length})</span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA bottom */}
        <motion.div
          className="mt-20 text-center border border-ember-400/15 bg-obsidian-800/60 p-8 max-w-lg mx-auto"
          variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
        >
          <Tag size={24} className="text-ember-400 mx-auto mb-3" />
          <p className="font-display text-white font-bold text-lg mb-2">Commande personnalisée</p>
          <p className="font-body text-zinc-500 text-sm mb-5 leading-relaxed">
            Besoin d'une personnalisation, d'une quantité spéciale ou d'un produit non listé? Contacte-nous directement.
          </p>
          <a
            href="mailto:comiteetuinfo@cegepstfe.ca?subject=[LAN 2026] Commande boutique personnalisée"
            className="inline-flex items-center gap-2 font-mono text-xs text-ember-400 border border-ember-400/30 px-6 py-2.5 hover:border-ember-400 hover:bg-ember-400/5 transition-all"
          >
            comiteetuinfo@cegepstfe.ca <ChevronRight size={12} />
          </a>
        </motion.div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={(product, size, qty) => { addToCart(product, size, qty); }}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cart={cart}
            onClose={() => setCartOpen(false)}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
