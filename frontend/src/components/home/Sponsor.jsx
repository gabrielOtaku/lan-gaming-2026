import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  scrollReveal,
  staggerContainer,
  fadeInUp,
  EASE_GAME,
} from "../../utils/animations.js";
import { getPartners } from "../../utils/api.js";

// ── Source unique de vérité ────────────────────────────────────────────────
// Cette bannière consommait auparavant sa propre liste codée en dur avec des
// logos récupérés via Clearbit (service externe). Elle lit maintenant
// GET /api/partners — la même source que /partenaires (cahier §6) — et
// affiche des badges à initiales plutôt que de dépendre d'un service de
// récupération de logo externe.

const TIER_COLORS = {
  principal: "#FFD700",
  charitable: "#FF6B6B",
  diamant: "#4FC3F7",
  or: "#C89B3C",
  argent: "#A0A0A0",
  bronze: "#B87333",
};

const TIER_LABEL = {
  charitable: "Partenaire caritatif",
  diamant: "Diamant",
  or: "Or",
  argent: "Argent",
  bronze: "Bronze",
};

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Badge partenaire — initiales, aucune dépendance externe ──────────────────
function PartnerLogo({ partner }) {
  const color = TIER_COLORS[partner.tier] || TIER_COLORS.or;

  return (
    <motion.a
      href={partner.url && partner.url !== "#" ? partner.url : undefined}
      target={partner.url && partner.url !== "#" ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 group flex-shrink-0 px-5"
      whileHover={{ scale: 1.08, y: -4 }}
      transition={{ duration: 0.25, ease: EASE_GAME }}
    >
      <motion.div
        className="w-16 h-16 rounded-sm border flex items-center justify-center bg-obsidian-800 relative overflow-hidden cursor-none"
        style={{ borderColor: `${color}25` }}
        whileHover={{
          borderColor: color,
          boxShadow: `0 0 25px ${color}40, 0 0 50px ${color}15`,
        }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }}
        />
        <span className="relative z-10 font-display font-black text-sm tracking-widest" style={{ color }}>
          {initials(partner.name)}
        </span>
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
          animate={{ backgroundPositionY: ["0%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{
            background: `linear-gradient(to bottom, transparent 30%, ${color}10 50%, transparent 70%)`,
            backgroundSize: "100% 200%",
          }}
        />
      </motion.div>

      <p className="font-body text-zinc-600 text-xs text-center tracking-wide max-w-[80px] leading-tight group-hover:text-zinc-300 transition-colors duration-300">
        {partner.name}
      </p>
    </motion.a>
  );
}

// ── Infinite scroll ticker ────────────────────────────────────────────────────
function InfinitePartnerTicker({ partners }) {
  const doubled = [...partners, ...partners, ...partners];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-obsidian-800 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-obsidian-800 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-end py-6"
        animate={{ x: [0, `-${100 / 3}%`] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((partner, i) => (
          <PartnerLogo key={`${partner.id}-${i}`} partner={partner} />
        ))}
      </motion.div>
    </div>
  );
}

// ── Tier separator ────────────────────────────────────────────────────────────
function TierBadge({ label, color }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${color}50, transparent)` }} />
      <span className="font-mono text-xs tracking-widest uppercase" style={{ color: `${color}80` }}>
        [{label}]
      </span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${color}50, transparent)` }} />
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function PartnerBanner() {
  const [partners, setPartners] = useState(null);

  useEffect(() => {
    getPartners()
      .then((r) => setPartners(r.data || []))
      .catch(() => setPartners([]));
  }, []);

  if (!partners) return null;

  const principalPartner = partners.find((p) => p.tier === "principal");
  const otherPartners = partners.filter((p) => p.tier !== "principal");
  // Chaque tier présent dans la réponse obtient sa propre section groupée,
  // dans l'ordre où le backend les renvoie (Fondation d'abord, cf. cahier §6).
  const tiersInOrder = [...new Set(otherPartners.map((p) => p.tier))];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-obsidian-800" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember-400/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember-400/30 to-transparent" />

      {/* Subtle circuit board background */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(200,155,60,0.5) 40px, rgba(200,155,60,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(200,155,60,0.5) 40px, rgba(200,155,60,0.5) 41px)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            [ Nos alliés stratégiques ]
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-5xl font-black text-white uppercase tracking-tight"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Nos{" "}
            <span className="text-ember-300 text-ember-glow">Partenaires</span>
          </motion.h2>
          <motion.p
            className="font-body text-zinc-500 max-w-xl mx-auto mt-4 text-sm leading-relaxed"
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Des entreprises régionales et nationales qui croient en la puissance
            du gaming étudiant au cœur du Saguenay–Lac-Saint-Jean.
          </motion.p>
        </div>

        {/* Principal partner — featured */}
        {principalPartner && (
          <motion.div
            className="mb-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <TierBadge label="Présentateur officiel" color="#FFD700" />
            <div className="flex justify-center">
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center gap-5 group"
              >
                <motion.div
                  className="w-32 h-32 clip-hex border border-ember-300/30 flex items-center justify-center bg-obsidian-700 relative overflow-hidden"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255,215,0,0.15)",
                      "0 0 50px rgba(255,215,0,0.4)",
                      "0 0 20px rgba(255,215,0,0.15)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="absolute inset-2 rounded-full border border-ember-400/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="font-display font-black text-3xl text-ember-300 relative z-10 tracking-widest text-gold-glow">
                    {initials(principalPartner.name)}
                  </span>
                </motion.div>
                <div className="text-center">
                  <p className="font-display text-ember-300 font-bold tracking-wide">
                    {principalPartner.name}
                  </p>
                  <p className="font-mono text-ember-600 text-[10px] tracking-widest uppercase mt-1">
                    Présentateur officiel
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Partners ticker — un bloc par tier, dans l'ordre reçu du backend */}
        {tiersInOrder.map((tier) => (
          <div key={tier} className="mb-4">
            <TierBadge
              label={TIER_LABEL[tier] || "Partenaires confirmés"}
              color={TIER_COLORS[tier] || "#C89B3C"}
            />
            <InfinitePartnerTicker partners={otherPartners.filter((p) => p.tier === tier)} />
          </div>
        ))}

        {/* Become a partner CTA */}
        <motion.div
          className="text-center mt-14"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="inline-block border border-ember-400/15 bg-obsidian-900/50 px-8 py-6 max-w-lg w-full">
            <p className="font-mono text-ember-600 text-[10px] tracking-[0.4em] uppercase mb-2">
              Rejoindre l'aventure
            </p>
            <p className="font-body text-zinc-400 text-sm mb-5 leading-relaxed">
              Intéressé à devenir partenaire de LAN Gaming 2026? Tiers Diamant
              (5 000$+), Or (2 000$+), Argent (500$+), Bronze.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/partenariat.pdf"
                download="Partenariat-LAN-Gaming-2026.pdf"
                className="inline-flex items-center gap-2 font-mono text-xs text-ember-400 border border-ember-400/30 px-5 py-2.5 hover:border-ember-400 hover:text-ember-300 hover:bg-ember-400/5 transition-all duration-300"
              >
                ↓ Dossier partenariat (PDF)
              </a>
              <a
                href="mailto:comiteetuinfo@cegepstfe.ca"
                className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 border border-zinc-800 px-5 py-2.5 hover:border-zinc-600 hover:text-zinc-300 transition-all duration-300"
              >
                comiteetuinfo@cegepstfe.ca →
              </a>
            </div>
            <a
              href="/partenaires"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-600 hover:text-ember-400 tracking-widest uppercase mt-5 transition-colors duration-300"
            >
              Voir tous nos partenaires →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
