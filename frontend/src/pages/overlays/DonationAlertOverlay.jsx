import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useDonationAlerts } from "../../hooks/useDonationAlerts.js";

// Browser Source OBS/Streamlabs — alerte à chaque don (guide §11). Fond
// transparent, file d'attente gérée par useDonationAlerts (7s/alerte, ne
// jamais en écraser une pendant une rafale).
export default function DonationAlertOverlay() {
  const { current } = useDonationAlerts();

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  const name = current?.is_anonymous ? "Anonyme" : (current?.display_name || "Anonyme");
  const amount = current ? current.amount_cents / 100 : 0;

  return (
    <div style={{ background: "transparent", minHeight: "100vh", padding: 32 }}>
      <div style={{ position: "fixed", bottom: 32, left: 32, width: 380 }}>
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 18 }}
              style={{
                background: "linear-gradient(135deg, rgba(200,155,60,0.95), rgba(255,215,0,0.95))",
                padding: "16px 20px",
                clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                boxShadow: "0 0 50px rgba(255,215,0,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Star size={24} color="#07090F" fill="#07090F" />
              <div>
                <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: "0.2em", color: "rgba(7,9,15,0.7)", textTransform: "uppercase" }}>
                  Nouveau don
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#07090F" }}>
                  {amount.toLocaleString("fr-CA")}$ — Merci {name} !
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
