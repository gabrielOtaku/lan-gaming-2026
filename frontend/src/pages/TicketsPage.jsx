import React, { useRef, Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import WebGLErrorBoundary from '../components/layout/WebGLErrorBoundary.jsx';
import * as THREE from 'three';
import { pageTransition, scrollReveal, EASE_GAME } from '../utils/animations.js';
import TicketModal from '../components/tickets/TicketModal.jsx';
import { Shield, Clock, MapPin, Users, Zap, ChevronDown, Timer, AlertTriangle } from 'lucide-react';
import { getTicketsStatus } from '../utils/api.js';

// ── 3D ticket hero scene ──────────────────────────────────────────────────────
function TicketOrb() {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * -0.1;
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={ringRef}>
        <torusGeometry args={[2.2, 0.03, 8, 80]} />
        <meshBasicMaterial color="#C89B3C" transparent opacity={0.4} />
      </mesh>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color="#07090F"
            emissive="#C89B3C"
            emissiveIntensity={0.25}
            distort={0.35}
            speed={2}
            roughness={0.05}
            metalness={0.95}
          />
        </mesh>
      </Float>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function TicketBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <WebGLErrorBoundary>
        <Canvas camera={{ position: [0, 0, 5], fov: 65 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[3, 2, 2]} intensity={2} color="#C89B3C" />
          <pointLight position={[-3, -2, 1]} intensity={0.8} color="#FF4655" />
          <Suspense fallback={null}>
            <Stars radius={50} depth={20} count={600} factor={2} saturation={0} fade speed={0.4} />
            <TicketOrb />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────
function TicketsHero() {
  return (
    <div className="relative h-72 md:h-96 flex items-end overflow-hidden">
      <TicketBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900/50 via-transparent to-obsidian-900" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
        <motion.p
          className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          [ Billets officiels ]
        </motion.p>
        <motion.h1
          className="font-display text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          Réserve ta{' '}
          <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}>
            Place
          </span>
        </motion.h1>
        <motion.div
          className="flex items-center gap-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <div className="h-px w-12 bg-ember-400" />
          <p className="font-body text-zinc-500 text-sm">
            Billets disponibles en quantité limitée — Ne manque pas l'événement gaming de l'année
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Event info quick bar ──────────────────────────────────────────────────────
function EventInfoBar() {
  const infos = [
    { icon: Clock,  label: 'Dates',     value: '9 – 11 Octobre 2026' },
    { icon: MapPin, label: 'Lieu',      value: 'Cégep de Saint-Félicien' },
    { icon: Users,  label: 'Capacité',  value: '150+ participants' },
    { icon: Zap,    label: 'Format',    value: '47h non-stop' },
  ];

  return (
    <motion.div
      className="bg-obsidian-800 border-y border-ember-400/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-ember-400/10">
          {infos.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 md:px-6 first:pl-0 last:pr-0">
              <Icon size={16} className="text-ember-500 flex-shrink-0" />
              <div>
                <p className="font-mono text-zinc-700 text-[10px] tracking-widest uppercase">{label}</p>
                <p className="font-body font-semibold text-zinc-300 text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Countdown component ───────────────────────────────────────────────────────
function useCountdown(deadline) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    function calc() {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) return setTimeLeft(null);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return timeLeft;
}

function CountdownDeadline({ deadline, salesClosed }) {
  const timeLeft = useCountdown(deadline);

  if (salesClosed) {
    return (
      <motion.div
        className="border border-red-500/40 bg-red-500/5 p-4 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
        <p className="font-mono text-red-400 text-xs tracking-wide">
          <span className="font-bold">Billetterie fermée</span> — La vente de billets est terminée. À bientôt dans l'arène !
        </p>
      </motion.div>
    );
  }

  if (!timeLeft) return null;

  const units = [
    { label: 'Jours',    value: timeLeft.d },
    { label: 'Heures',   value: timeLeft.h },
    { label: 'Minutes',  value: timeLeft.m },
    { label: 'Secondes', value: timeLeft.s },
  ];

  return (
    <motion.div
      className="border border-ember-400/25 bg-ember-400/5 p-4 md:p-5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Timer size={15} className="text-ember-400 flex-shrink-0" />
          <div>
            <p className="font-mono text-ember-500 text-[10px] tracking-[0.4em] uppercase">Fermeture des ventes</p>
            <p className="font-body text-zinc-400 text-xs">2 octobre 2026 à 23h59</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {units.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div
                className="w-12 h-10 md:w-14 md:h-12 bg-obsidian-900 border border-ember-400/20 flex items-center justify-center"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
              >
                <span className="font-mono font-bold text-ember-300 text-base md:text-lg tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
              </div>
              <p className="font-mono text-zinc-700 text-[8px] tracking-widest uppercase mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Seats availability bar ────────────────────────────────────────────────────
function SeatsBar({ inventory, salesClosed }) {
  if (!inventory) return null;

  const items = [
    { key: 'visiteur',    label: 'Visiteur',    color: '#4FC3F7' },
    { key: 'joueur',      label: 'Joueur',      color: '#C89B3C' },
    { key: 'competiteur', label: 'Compétiteur', color: '#FFD700' },
  ];

  return (
    <motion.div
      className="border border-zinc-800 bg-obsidian-800/60 p-4 md:p-5 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <p className="font-mono text-zinc-600 text-[10px] tracking-[0.4em] uppercase mb-4">Places disponibles en temps réel</p>
      <div className="grid grid-cols-3 gap-4">
        {items.map(({ key, label, color }) => {
          const inv = inventory[key];
          if (!inv) return null;
          const pct = Math.max(0, Math.min(100, (inv.remaining / inv.capacity) * 100));
          const isSoldOut = inv.remaining <= 0;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-zinc-500 text-[9px] tracking-widest uppercase">{label}</span>
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: isSoldOut ? '#FF4655' : color }}
                >
                  {isSoldOut ? 'Épuisé' : inv.remaining}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: isSoldOut ? '#FF4655' : color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="font-mono text-zinc-700 text-[8px] mt-1">
                {isSoldOut ? '0' : inv.remaining} / {inv.capacity} places
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'Quand et où se déroule l\'événement ?',
    a: 'LAN Gaming 2026 se tient du vendredi 9 au dimanche 11 octobre 2026 au Cégep de Saint-Félicien (525, boul. Hamel, Saint-Félicien, QC G8K 2R8). Les portes ouvrent à 17h avec le bal d\'ouverture à la Salle Azimut.',
  },
  {
    q: 'Quelle est la différence entre Joueur et Compétiteur ?',
    a: 'Le billet Joueur (30$) donne un poste LAN fixe et accès à toutes les arènes pendant 47h. Le Compétiteur (50$) inclut tout ça plus l\'inscription officielle aux tournois (LoL, CS2, Rocket League, Magic:TG, Smash Bros, Mario Kart) et rend éligible aux cash prizes.',
  },
  {
    q: 'Les visiteurs peuvent-ils assister sans jouer ?',
    a: 'Absolument ! Le billet Visiteur (15$) donne accès libre à l\'ensemble de l\'événement, à la zone spectateurs, aux consoles et aux kiosques partenaires.',
  },
  {
    q: 'Faut-il apporter son propre équipement ?',
    a: 'Oui, les joueurs et compétiteurs apportent leur propre équipement (maximum 1 PC + 1 écran par personne). Vous pouvez également apporter vos périphériques. Les visiteurs n\'ont rien à apporter.',
  },
  {
    q: 'Y a-t-il un âge minimum pour participer ?',
    a: 'Les billets Joueur et Compétiteur sont réservés aux 17 ans et plus. Le billet Visiteur est ouvert à tous. Les participants mineurs doivent avoir l\'autorisation d\'un tuteur légal.',
  },
  {
    q: 'La billetterie est-elle remboursable ?',
    a: 'Les billets sont remboursables jusqu\'à 7 jours avant l\'événement (2 octobre 2026). Passé ce délai, les billets sont non-remboursables mais transférables. Contactez-nous à comiteetuinfo@cegepstfe.ca ou au 581 704-1221 pour toute demande.',
  },
];

function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-zinc-800 last:border-0"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <button
        className="w-full flex items-center justify-between py-4 text-left group"
        onClick={() => setOpen(!open)}
      >
        <span className={`font-body font-semibold text-sm md:text-base transition-colors ${open ? 'text-ember-200' : 'text-zinc-300 group-hover:text-white'}`}>
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown size={16} className={`transition-colors ${open ? 'text-ember-400' : 'text-zinc-600'}`} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_GAME }}
            className="overflow-hidden"
          >
            <p className="font-body text-zinc-500 text-sm leading-relaxed pb-5 pr-8">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Security trust section ─────────────────────────────────────────────────────
function TrustSection() {
  const items = [
    { icon: Shield, title: 'Paiement 100% sécurisé', desc: 'Billetterie officielle du Cégep de Saint-Félicien. Transactions chiffrées SSL.' },
    { icon: Clock, title: 'Confirmation immédiate', desc: 'Reçois ton billet électronique par courriel dans les 5 minutes suivant l\'achat.' },
    { icon: Users, title: 'Support dédié', desc: 'Une question ? Contacte l\'équipe organisatrice à comiteetuinfo@cegepstfe.ca.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-16">
      {items.map(({ icon: Icon, title, desc }, i) => (
        <motion.div
          key={title}
          className="p-5 border border-zinc-800 bg-glass text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Icon size={20} className="text-ember-500 mx-auto mb-3" />
          <h4 className="font-display font-bold text-white text-sm tracking-wide mb-2">{title}</h4>
          <p className="font-body text-zinc-600 text-xs leading-relaxed">{desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const [ticketStatus, setTicketStatus] = useState(null);

  useEffect(() => {
    getTicketsStatus()
      .then(res => setTicketStatus(res.data))
      .catch(() => {});
    const id = setInterval(() => {
      getTicketsStatus().then(res => setTicketStatus(res.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const salesClosed = ticketStatus?.salesClosed ?? false;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      <TicketsHero />
      <EventInfoBar />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">

        {/* Countdown + seats */}
        <div className="mb-10 space-y-4">
          {ticketStatus && (
            <CountdownDeadline
              deadline={ticketStatus.deadline}
              salesClosed={salesClosed}
            />
          )}
          {!salesClosed && (
            <SeatsBar inventory={ticketStatus?.inventory} salesClosed={salesClosed} />
          )}
        </div>

        {/* Section title */}
        <div className="text-center mb-12">
          <motion.p
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            [ Choisir mon billet ]
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-5xl font-black text-white uppercase tracking-tight"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Sélectionne ton{' '}
            <span className="text-ember-300 text-ember-glow">Expérience</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <TicketModal inventory={ticketStatus?.inventory} salesClosed={salesClosed} />
        </motion.div>

        <TrustSection />

        {/* FAQ */}
        <div className="mt-20">
          <motion.div
            className="text-center mb-10"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4">[ Foire aux questions ]</p>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Questions <span className="text-ember-300">Fréquentes</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto border border-zinc-800 bg-glass p-4 md:p-8">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Final CTA */}
        {!salesClosed && (
          <motion.div
            className="text-center mt-20 py-16 border border-ember-400/10 relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-ember-glow opacity-40" />
            <div className="relative z-10">
              <p className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4">[ Rejoins-nous ]</p>
              <h3 className="font-display text-3xl md:text-5xl font-black text-white uppercase mb-4">
                Prêt à entrer dans l'arène ?
              </h3>
              <p className="font-body text-zinc-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                Des centaines de joueurs. Trois jours de compétitions. Une communauté. Ton billet t'attend.
              </p>
              <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <motion.button
                  className="px-10 py-4 clip-diagonal bg-ember-400 text-obsidian-900 font-display font-black tracking-widest uppercase text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: ['0 0 20px rgba(200,155,60,0.3)', '0 0 50px rgba(255,215,0,0.6)', '0 0 20px rgba(200,155,60,0.3)'],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  ⚔ Obtenir mes billets
                </motion.button>
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
