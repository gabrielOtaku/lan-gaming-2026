import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { getCagnotte } from "../utils/api.js";

const POLL_MS = 5000;
const ALERT_DURATION_MS = 7000;
const MILESTONE_FRACTIONS = [0.25, 0.5, 0.75, 1];

function nextMilestone(totalRaised, goal) {
  for (const f of MILESTONE_FRACTIONS) {
    const threshold = Math.round(goal * f);
    if (totalRaised < threshold) return threshold;
  }
  return null;
}

// Clé stable pour repérer les dons déjà vus entre deux polls, sans dépendre
// d'un id serveur (le store actuel n'en fournit pas) — voir §10.4.
function donationKey(d) {
  return `${d.at}|${d.username}|${d.amount}`;
}

export default function DonationOverlayPage() {
  const [data, setData] = useState(null);
  const [alertQueue, setAlertQueue] = useState([]);
  const [connectionLost, setConnectionLost] = useState(false);
  const seenKeys = useRef(new Set());
  const isFirstLoad = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await getCagnotte();
      const fresh = res.data;
      setConnectionLost(false);

      if (isFirstLoad.current) {
        // Au premier chargement, on marque les dons existants comme "déjà
        // vus" — on ne veut pas déclencher une rafale d'alertes pour tout
        // l'historique dès l'ouverture de la Browser Source dans OBS.
        (fresh.recentDonations || []).forEach((d) => seenKeys.current.add(donationKey(d)));
        isFirstLoad.current = false;
      } else {
        const newOnes = (fresh.recentDonations || []).filter((d) => !seenKeys.current.has(donationKey(d)));
        newOnes.forEach((d) => seenKeys.current.add(donationKey(d)));
        if (newOnes.length > 0) {
          setAlertQueue((q) => [...q, ...newOnes.reverse().map((d) => ({ ...d, key: donationKey(d) }))]);
        }
      }

      setData(fresh);
    } catch {
      // §10.3 — connexion perdue : on garde la dernière valeur connue et on
      // retente au prochain intervalle, sans jamais remettre la cagnotte à zéro.
      setConnectionLost(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  // Une seule alerte visible à la fois, dépilée dans l'ordre d'arrivée.
  useEffect(() => {
    if (alertQueue.length === 0) return;
    const timer = setTimeout(() => {
      setAlertQueue((q) => q.slice(1));
    }, ALERT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [alertQueue]);

  const totalRaised = data?.totalRaised ?? 0;
  const goal = data?.goal || 100000;
  const pct = Math.min(100, (totalRaised / goal) * 100);
  const milestone = nextMilestone(totalRaised, goal);
  const currentAlert = alertQueue[0];

  return (
    <div style={{ background: "transparent", minHeight: "100vh", padding: 32, fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Widget permanent — cagnotte */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: 32,
          width: 380,
          background: "rgba(7,9,15,0.88)",
          border: "1px solid rgba(255,215,0,0.35)",
          padding: "18px 22px",
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          boxShadow: "0 0 40px rgba(255,215,0,0.12)",
          opacity: data ? 1 : 0,
          transition: "opacity 0.4s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Heart size={16} color="#FFD700" fill="#FFD700" />
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: "0.3em", color: "#FFD700", textTransform: "uppercase" }}>
            Fondation du Cégep CSF
          </span>
          {connectionLost && (
            <span style={{ marginLeft: "auto", fontSize: 9, color: "#EF4444", fontFamily: "monospace" }}>
              reconnexion…
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 900, fontSize: 30, color: "#fff" }}>
            {totalRaised.toLocaleString("fr-CA")}$
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#9A8F78" }}>
            / {goal.toLocaleString("fr-CA")}$
          </span>
        </div>

        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden", clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, #C89B3C, #FFD700)" }}
          />
        </div>

        {milestone && (
          <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", color: "#7A7060", textTransform: "uppercase" }}>
            Prochain objectif : {milestone.toLocaleString("fr-CA")}$
          </div>
        )}
      </div>

      {/* Alerte nouveau don — une à la fois, en file (§10.4) */}
      <div style={{ position: "fixed", bottom: 190, left: 32, width: 380 }}>
        <AnimatePresence mode="wait">
          {currentAlert && (
            <motion.div
              key={currentAlert.key}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 18 }}
              style={{
                background: "linear-gradient(135deg, rgba(200,155,60,0.95), rgba(255,215,0,0.95))",
                padding: "14px 18px",
                clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                boxShadow: "0 0 50px rgba(255,215,0,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Star size={22} color="#07090F" fill="#07090F" />
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#07090F" }}>
                  {currentAlert.username || "Anonyme"} — +{currentAlert.amount}$
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(7,9,15,0.7)", textTransform: "uppercase" }}>
                  Nouveau don
                </div>
                {/* Le serveur ne renvoie un message que s'il a été approuvé — §9.4 */}
                {currentAlert.message && (
                  <div style={{ fontSize: 12, color: "rgba(7,9,15,0.85)", marginTop: 4, maxWidth: 260 }}>
                    « {currentAlert.message} »
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
