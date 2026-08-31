import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import {
  Heart,
  Star,
  Trophy,
  Zap,
  Users,
  TrendingUp,
  Gift,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  scrollReveal,
  EASE_GAME,
} from "../utils/animations.js";
import { useDonationCampaign } from "../hooks/useDonationCampaign.js";
import DonateButton from "../components/donations/DonateButton.jsx";

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1.5,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false });
  const prevValue = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(prevValue.current, value, {
      duration,
      ease: EASE_GAME,
      onUpdate: (v) => {
        if (ref.current)
          ref.current.textContent = `${prefix}${Math.round(v).toLocaleString("fr-CA")}${suffix}`;
      },
    });
    prevValue.current = value;
    return controls.stop;
  }, [value, inView, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function FundingBar({ current, goal, color = "#C89B3C" }) {
  const pct = Math.min(100, (current / goal) * 100);
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="relative w-full">
      <div
        className="relative h-3 bg-obsidian-700 overflow-hidden"
        style={{
          clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
        }}
      >
        <motion.div
          className="h-full relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${color}80, ${color}, #FFD700)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: inView ? `${pct}%` : 0 }}
          transition={{ duration: 2, ease: EASE_GAME, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="font-mono text-[10px] text-zinc-600 tracking-widest">
          {pct.toFixed(1)}% atteint
        </span>
        <span
          className="font-mono text-[10px] tracking-widest"
          style={{ color }}
        >
          {goal.toLocaleString("fr-CA")}$ objectif
        </span>
      </div>
    </div>
  );
}

// ── Ticket d'Or Card ──────────────────────────────────────────────────────────
function TicketOrCard({ data, onPurchase }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      variants={scrollReveal}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="relative overflow-hidden border border-amber-500/30 bg-obsidian-800/80"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        boxShadow:
          "0 0 40px rgba(255,215,0,0.08), inset 0 0 40px rgba(255,215,0,0.03)",
      }}
    >
      {/* Gold shimmer background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-[0.04]"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(90deg, transparent, #FFD700, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 15, -10, 5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Star size={22} className="text-amber-400 fill-amber-400" />
              </motion.div>
              <span className="font-mono text-amber-500 text-[10px] tracking-[0.5em] uppercase">
                Exclusif
              </span>
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-black text-amber-300 leading-tight"
              style={{ textShadow: "0 0 30px rgba(255,215,0,0.4)" }}
            >
              Ticket d'Or
            </h2>
            <p className="font-mono text-amber-700 text-xs tracking-widest mt-1">
              Moitié-Moitié · Fondation CSF
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display font-black text-4xl text-amber-300">
              {data.ticketOrPrice || 10}$
            </p>
            <p className="font-mono text-amber-700 text-[9px] tracking-widest uppercase">
              par ticket
            </p>
          </div>
        </div>

        {/* Live pot */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className="border border-amber-500/20 bg-obsidian-900/60 p-4 text-center"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mb-1">
              Cagnotte actuelle
            </p>
            <AnimatedCounter
              value={data.ticketOrPot || 0}
              suffix="$"
              className="font-display font-black text-2xl text-amber-300"
            />
          </div>
          <div
            className="border border-amber-500/20 bg-obsidian-900/60 p-4 text-center"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mb-1">
              Tickets vendus
            </p>
            <AnimatedCounter
              value={data.ticketOrSold || 0}
              className="font-display font-black text-2xl text-amber-300"
            />
          </div>
        </div>

        {/* How it works */}
        <div className="border border-amber-500/10 bg-obsidian-900/40 p-4 mb-6 space-y-2">
          <p className="font-mono text-amber-600 text-[9px] tracking-[0.4em] uppercase mb-3">
            Comment ça fonctionne
          </p>
          {[
            {
              icon: Star,
              text: `Achète un Ticket d'Or à ${data.ticketOrPrice || 10}$ — 100% va dans le pot commun`,
            },
            {
              icon: Trophy,
              text: "Lors de la Grande Finale, un gagnant aléatoire est tiré au sort en direct sur Twitch",
            },
            {
              icon: Heart,
              text: "50% du pot total va au gagnant · 50% est reversé à la Fondation du Cégep",
            },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <Icon size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="font-body text-zinc-400 text-sm leading-relaxed">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Example payout */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          {[
            {
              label: "Pot si 50 tickets",
              val: `${((data.ticketOrPrice || 10) * 50).toLocaleString("fr-CA")}$`,
              sub: "500$ gagnant · 500$ Fondation",
            },
            {
              label: "Pot si 100 tickets",
              val: `${((data.ticketOrPrice || 10) * 100).toLocaleString("fr-CA")}$`,
              sub: "1 000$ gagnant · 1 000$ Fondation",
            },
            {
              label: "Pot si 200 tickets",
              val: `${((data.ticketOrPrice || 10) * 200).toLocaleString("fr-CA")}$`,
              sub: "2 000$ gagnant · 2 000$ Fondation",
            },
          ].map(({ label, val, sub }) => (
            <div
              key={label}
              className="border border-zinc-800 bg-obsidian-900/50 p-3"
            >
              <p className="font-mono text-zinc-700 text-[8px] tracking-wide uppercase mb-1">
                {label}
              </p>
              <p className="font-display font-black text-sm text-amber-400">
                {val}
              </p>
              <p className="font-mono text-zinc-600 text-[8px] leading-relaxed mt-1">
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={onPurchase}
          className="w-full py-4 font-display font-black text-base tracking-widest uppercase text-obsidian-900 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #C89B3C, #FFD700, #C89B3C)",
            clipPath:
              "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
          whileHover={{ scale: 1.01, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Star size={16} className="fill-current" />
            Acheter un Ticket d'Or — {data.ticketOrPrice || 10}$
            <Star size={16} className="fill-current" />
          </span>
        </motion.button>
        <p className="font-mono text-zinc-700 text-[9px] tracking-widest text-center mt-3">
          Tirage en direct · Grande Finale Dimanche 11 oct. 2026 à 13h00
        </p>
      </div>
    </motion.div>
  );
}

// ── Purchase Modal ────────────────────────────────────────────────────────────
function PurchaseModal({ onClose, ticketPrice }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [qty, setQty] = useState(1);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const total = ticketPrice * qty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/cagnotte/ticket-or", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, quantity: qty }),
      });
    } catch {
      /* fallback: email link */
    }
    setSent(true);
    setSending(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-obsidian-900/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-md bg-obsidian-800 border border-amber-500/30 shadow-[0_0_80px_rgba(255,215,0,0.15)]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <p className="font-display text-amber-300 font-bold tracking-widest text-sm">
              Ticket d'Or
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-amber-300 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center mx-auto mb-4"
              >
                <Star size={28} className="text-amber-400 fill-amber-400" />
              </motion.div>
              <p className="font-display text-amber-300 font-bold text-lg mb-2">
                Demande reçue!
              </p>
              <p className="font-body text-zinc-400 text-sm leading-relaxed mb-4">
                Notre équipe va te contacter pour finaliser l'achat. Vérifie ton
                courriel.
              </p>
              <p className="font-mono text-zinc-600 text-[10px] tracking-widest">
                comiteetuinfo@cegepstfe.ca
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-widest hover:bg-amber-500/10 transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              <div>
                <label className="font-mono text-amber-600 text-[10px] tracking-widest uppercase block mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jean Tremblay"
                  className="w-full bg-obsidian-900 border border-zinc-800 focus:border-amber-400/60 text-white text-sm px-3 py-2.5 outline-none transition-colors font-body placeholder-zinc-700"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  }}
                />
              </div>
              <div>
                <label className="font-mono text-amber-600 text-[10px] tracking-widest uppercase block mb-1.5">
                  Courriel
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ton@courriel.ca"
                  className="w-full bg-obsidian-900 border border-zinc-800 focus:border-amber-400/60 text-white text-sm px-3 py-2.5 outline-none transition-colors font-body placeholder-zinc-700"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  }}
                />
              </div>
              <div>
                <label className="font-mono text-amber-600 text-[10px] tracking-widest uppercase block mb-1.5">
                  Nombre de tickets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono text-white text-lg w-8 text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(10, qty + 1))}
                    className="w-9 h-9 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                  <span className="font-display font-black text-amber-300 text-xl ml-2">
                    {total}$
                  </span>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 font-display font-bold text-sm tracking-widest uppercase text-obsidian-900 disabled:opacity-60 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #C89B3C, #FFD700)",
                  clipPath:
                    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {sending
                  ? "Envoi..."
                  : `Réserver ${qty} Ticket${qty > 1 ? "s" : ""} d'Or — ${total}$`}
              </motion.button>
              <p className="font-mono text-zinc-700 text-[9px] tracking-widest text-center">
                Paiement finalisé sur place à l'événement
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CagnottePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const donStatus = searchParams.get("don"); // 'succes' | null — jamais utilisé pour incrémenter quoi que ce soit (§8.5 cahier / règle non négociable du guide Supabase)

  // Dons en ligne (Stripe Payment Link) : Supabase est la seule source de
  // vérité, temps réel via Realtime — jamais recalculé ici.
  const { campaign, nextMilestone, error: campaignError } = useDonationCampaign();

  // Ticket d'Or + dons Twitch natifs (saisie manuelle admin) restent sur
  // l'ancien store Express/JSON — canaux distincts, non couverts par le guide.
  const [data, setData] = useState({
    twitchTotal: 0,
    ticketOrTotal: 0,
    ticketOrSold: 0,
    ticketOrPot: 0,
    ticketOrPrice: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const raisedOnline = (campaign?.raised_cents || 0) / 100;
  const goal = (campaign?.goal_cents || 10000000) / 100;
  const totalRaised = raisedOnline + (data.twitchTotal || 0) + (data.ticketOrTotal || 0);

  const dismissDonStatus = () => {
    searchParams.delete("don");
    setSearchParams(searchParams, { replace: true });
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/cagnotte", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data || json);
      setError(null);
    } catch (err) {
      setError("Impossible de charger le Ticket d'Or / dons Twitch en temps réel.");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const statsCards = [
    {
      label: "Total fondation",
      value: totalRaised,
      suffix: "$",
      color: "#C89B3C",
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: "Dons en ligne",
      value: raisedOnline,
      suffix: "$",
      color: "#9B59B6",
      icon: Zap,
    },
    {
      label: "Tickets d'Or",
      value: data.ticketOrTotal,
      suffix: "$",
      color: "#FFD700",
      icon: Star,
    },
    {
      label: "Participants",
      value: data.ticketOrSold,
      suffix: " tickets",
      color: "#4FC3F7",
      icon: Users,
    },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-20 pb-20 relative overflow-hidden"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(200,155,60,0.4) 50px, rgba(200,155,60,0.4) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(200,155,60,0.4) 50px, rgba(200,155,60,0.4) 51px)",
          }}
        />
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.05]"
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{
            background: "radial-gradient(ellipse, #FFD700, transparent)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-12 pt-8"
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-amber-600 text-xs tracking-[0.5em] uppercase mb-4"
          >
            [ Fondation du Cégep de Saint-Félicien ]
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-none mb-4"
          >
            <span className="text-white">Cagnotte</span>{" "}
            <span
              style={{
                color: "#FFD700",
                textShadow: "0 0 40px rgba(255,215,0,0.5)",
              }}
            >
              Fondation
            </span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="font-body text-zinc-500 max-w-lg mx-auto text-sm leading-relaxed"
          >
            Chaque don en ligne, don Twitch et Ticket d'Or vendu est
            entièrement reversé à la Fondation du Cégep de Saint-Félicien pour
            soutenir les bourses étudiantes.
          </motion.p>

          {/* Refresh indicator */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-3 mt-6"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-mono text-zinc-600 text-[9px] tracking-widest">
              Mise à jour automatique toutes les 30 secondes
            </span>
            <button
              onClick={fetchData}
              className="text-zinc-700 hover:text-amber-400 transition-colors"
              title="Actualiser"
            >
              <RefreshCw size={11} />
            </button>
          </motion.div>
        </motion.div>

        {/* Donation status banner — display-only, never touches the cagnotte (§8.5) */}
        <AnimatePresence>
          {donStatus === "succes" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between gap-2 bg-green-500/10 border border-green-500/25 text-green-400 font-mono text-xs px-4 py-3 mb-6"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={13} /> Merci pour ton don ! Il apparaîtra dans la cagnotte dès sa confirmation par Stripe.
              </span>
              <button onClick={dismissDonStatus} className="text-green-500/60 hover:text-green-300 transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {campaignError && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs px-4 py-3 mb-6">
            <AlertCircle size={13} /> Cagnotte en ligne indisponible : {campaignError}
          </div>
        )}

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs px-4 py-3 mb-6"
            >
              <AlertCircle size={13} /> {error} — données en cache affichées.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
        >
          {statsCards.map(
            ({ label, value, suffix, color, icon: Icon, highlight }) => (
              <motion.div
                key={label}
                variants={fadeInUp}
                className={`border bg-obsidian-800/80 p-4 text-center ${highlight ? "border-amber-500/40" : "border-zinc-800"}`}
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  boxShadow: highlight
                    ? "0 0 25px rgba(255,215,0,0.1)"
                    : "none",
                }}
              >
                <Icon size={16} className="mx-auto mb-2" style={{ color }} />
                <AnimatedCounter
                  value={value}
                  suffix={suffix}
                  className="font-display font-black text-xl block"
                  style={{ color }}
                />
                <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mt-1">
                  {label}
                </p>
              </motion.div>
            ),
          )}
        </motion.div>

        {/* Progress toward goal */}
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border border-amber-500/20 bg-obsidian-800/60 p-6 mb-10"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-white font-bold">
              Objectif de la Fondation
            </p>
            <div className="flex items-center gap-2">
              <AnimatedCounter
                value={totalRaised}
                suffix="$"
                className="font-display font-black text-amber-300 text-lg"
              />
              <span className="font-mono text-zinc-600 text-xs">
                / {goal.toLocaleString("fr-CA")}$
              </span>
            </div>
          </div>
          <FundingBar current={totalRaised} goal={goal} color="#FFD700" />
          <p className="font-mono text-zinc-600 text-[10px] tracking-widest text-center mt-4">
            Objectif atteint via dons en ligne + dons Twitch + ventes Tickets
            d'Or · Grande Finale en direct 11 oct. 2026
          </p>
        </motion.div>

        {/* Don direct — Stripe Payment Link + Supabase, la fonction phare */}
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border border-ember-400/30 bg-obsidian-800/80 p-6 md:p-8 mb-10 text-center"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            boxShadow: "0 0 40px rgba(200,155,60,0.1), inset 0 0 40px rgba(200,155,60,0.03)",
          }}
        >
          <p className="font-mono text-ember-500 text-[10px] tracking-[0.5em] uppercase mb-2">
            Don sécurisé
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-black text-white leading-tight mb-2">
            Faire un don direct
          </h2>
          <p className="font-body text-zinc-500 text-sm mb-6 max-w-md mx-auto">
            Paiement par carte hébergé par Stripe — choisis ton montant,
            affiche ton prénom ou reste anonyme, directement sur leur page
            sécurisée.
          </p>
          <div className="max-w-sm mx-auto">
            <DonateButton />
          </div>
          {nextMilestone && (
            <p className="font-mono text-zinc-600 text-[10px] tracking-widest mt-4">
              Prochain palier : {(nextMilestone.amount_cents / 100).toLocaleString("fr-CA")}$ — {nextMilestone.title}
            </p>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: Ticket d'Or */}
          <TicketOrCard data={data} onPurchase={() => setPurchaseOpen(true)} />

          {/* Right: Twitch + live feed */}
          <div className="space-y-5">
            {/* Twitch section */}
            <motion.div
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border border-purple-500/25 bg-obsidian-800/80 p-6"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-sm bg-purple-600/20 border border-purple-600/40 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-purple-400"
                  >
                    <path
                      d="M11.64 5.93H13.07V10.21H11.64M15.57 5.93H17V10.21H15.57M7 2L3.43 5.57V18.43H7.71V22L11.29 18.43H14.14L20.57 12V2M19.14 11.29L16.29 14.14H13.43L10.93 16.64V14.14H7.71V3.43H19.14Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-purple-300 font-bold text-base">
                    Dons Twitch en direct
                  </p>
                  <p className="font-mono text-purple-800 text-[9px] tracking-widest">
                    Grande Finale · 11 octobre 2026 · 13h00
                  </p>
                </div>
              </div>
              <p className="font-body text-zinc-400 text-sm leading-relaxed mb-4">
                La Grande Finale de LoL et CS2 est streamée en direct sur
                Twitch. 100% des dons Twitch pendant la finale sont reversés à
                la Fondation.
              </p>
              <div className="flex items-center justify-between border border-purple-500/15 bg-obsidian-900/50 p-3">
                <div>
                  <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase">
                    Dons reçus
                  </p>
                  <AnimatedCounter
                    value={data.twitchTotal}
                    suffix="$"
                    className="font-display font-black text-xl text-purple-300"
                  />
                </div>
                <a
                  href="https://www.twitch.tv/langamingcsf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-[10px] text-purple-400 border border-purple-500/30 px-3 py-1.5 hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                >
                  Twitch <ExternalLink size={10} />
                </a>
              </div>
            </motion.div>

            {/* Foundation info */}
            <motion.div
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border border-ember-400/15 bg-obsidian-800/60 p-5"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Heart size={14} className="text-ember-400" />
                <p className="font-display text-ember-300 font-bold text-sm">
                  Fondation du Cégep CSF
                </p>
              </div>
              <p className="font-body text-zinc-500 text-sm leading-relaxed mb-4">
                La Fondation distribue entre 30 000$ et 50 000$ en bourses
                chaque année à des étudiants méritants via deux programmes
                d'aide financière.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://cegepstfe.ca/fondation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-mono text-[10px] text-ember-500 hover:text-ember-300 transition-colors"
                >
                  <ExternalLink size={10} /> cegepstfe.ca/fondation
                </a>
                <a
                  href="https://www.cstfelicien.qc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-mono text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <ExternalLink size={10} /> cstfelicien.qc.ca
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Info footer */}
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Star,
              color: "#FFD700",
              title: "Ticket d'Or",
              body: "Seulement les ventes de Tickets d'Or (moitié-moitié) vont à la Fondation, pas les billets réguliers.",
            },
            {
              icon: Zap,
              color: "#9B59B6",
              title: "Dons Twitch",
              body: "100% des dons reçus sur le stream Twitch pendant la Grande Finale sont reversés intégralement.",
            },
            {
              icon: Trophy,
              color: "#C89B3C",
              title: "Impact réel",
              body: "Chaque dollar collecté contribue directement à financer les bourses étudiantes du Cégep.",
            },
          ].map(({ icon: Icon, color, title, body }) => (
            <div
              key={title}
              className="border border-zinc-800 bg-obsidian-800/50 p-5 text-center"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              <Icon size={20} className="mx-auto mb-3" style={{ color }} />
              <p className="font-display text-white font-bold text-sm mb-2">
                {title}
              </p>
              <p className="font-body text-zinc-500 text-xs leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseOpen && (
          <PurchaseModal
            onClose={() => setPurchaseOpen(false)}
            ticketPrice={data.ticketOrPrice || 10}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
