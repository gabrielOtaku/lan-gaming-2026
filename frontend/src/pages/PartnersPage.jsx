import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Download, Mail } from "lucide-react";
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  scrollReveal,
} from "../utils/animations.js";
import { getPartners } from "../utils/api.js";

// Ordre d'affichage — reflète l'engagement réel, pas l'ordre alphabétique.
// Seuls des partenaires confirmés apparaissent ici (§1.2, §15.2 du cahier) :
// cette page consomme GET /api/partners, la même source que le reste du site.
const TIER_ORDER = ["principal", "charitable", "diamant", "or", "argent", "bronze"];
const TIER_LABELS = {
  principal: "Organisateur officiel",
  charitable: "Partenaire caritatif",
  diamant: "Partenaires Diamant",
  or: "Partenaires Or",
  argent: "Partenaires Argent",
  bronze: "Partenaires Bronze",
};
const TIER_COLORS = {
  principal: "#FFD700",
  charitable: "#FF6B6B",
  diamant: "#4FC3F7",
  or: "#C89B3C",
  argent: "#A0A0A0",
  bronze: "#B87333",
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

function PartnerCard({ partner, color }) {
  const [imgError, setImgError] = useState(false);
  const hasLogo = partner.logo && !imgError;

  return (
    <motion.a
      variants={fadeInUp}
      href={partner.url && partner.url !== "#" ? partner.url : undefined}
      target={partner.url && partner.url !== "#" ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 border bg-obsidian-800/70 p-6 group"
      style={{
        borderColor: `${color}25`,
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        cursor: partner.url && partner.url !== "#" ? "pointer" : "default",
      }}
      whileHover={partner.url && partner.url !== "#" ? { borderColor: `${color}70`, y: -3 } : {}}
    >
      <div
        className="w-16 h-16 flex items-center justify-center border overflow-hidden"
        style={{ borderColor: `${color}40`, background: `${color}10` }}
      >
        {hasLogo ? (
          <img
            src={partner.logo}
            alt={partner.name}
            onError={() => setImgError(true)}
            className="w-[70%] h-[70%] object-contain"
            loading="lazy"
          />
        ) : (
          <span className="font-display font-black text-lg" style={{ color }}>
            {initials(partner.name)}
          </span>
        )}
      </div>
      <p className="font-body text-zinc-300 text-sm text-center leading-tight">{partner.name}</p>
      {partner.url && partner.url !== "#" && (
        <ExternalLink size={11} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
      )}
    </motion.a>
  );
}

export default function PartnersPage() {
  const [partners, setPartners] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPartners()
      .then((r) => setPartners(r.data || []))
      .catch(() => setError(true));
  }, []);

  const grouped = TIER_ORDER
    .map((tier) => ({ tier, list: (partners || []).filter((p) => p.tier === tier) }))
    .filter((g) => g.list.length > 0);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-24 relative overflow-hidden"
    >
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center mb-14">
          <motion.p variants={fadeInUp} className="font-mono text-ember-600 text-xs tracking-[0.5em] uppercase mb-4">
            [ Ils rendent LAN Gaming 2026 possible ]
          </motion.p>
          <motion.h1 variants={fadeInUp} className="font-display text-5xl sm:text-6xl font-black uppercase text-white leading-none mb-4">
            Nos <span className="text-ember-300 text-ember-glow">Partenaires</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="font-body text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            Des entreprises régionales et nationales qui croient en la puissance
            du gaming étudiant au Saguenay–Lac-Saint-Jean.
          </motion.p>
        </motion.div>

        {error && (
          <p className="text-center font-mono text-red-400 text-xs mb-10">
            Impossible de charger la liste des partenaires pour le moment.
          </p>
        )}

        {!partners && !error && (
          <p className="text-center font-mono text-zinc-600 text-xs mb-10">Chargement...</p>
        )}

        <div className="space-y-14 mb-16">
          {grouped.map(({ tier, list }) => (
            <motion.div key={tier} variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${TIER_COLORS[tier]}50, transparent)` }} />
                <span className="font-mono text-xs tracking-widest uppercase" style={{ color: `${TIER_COLORS[tier]}` }}>
                  {TIER_LABELS[tier]}
                </span>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${TIER_COLORS[tier]}50, transparent)` }} />
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              >
                {list.map((p) => (
                  <PartnerCard key={p.id} partner={p} color={TIER_COLORS[tier]} />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border border-ember-400/15 bg-obsidian-900/50 px-8 py-8 max-w-lg mx-auto text-center"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
        >
          <p className="font-mono text-ember-600 text-[10px] tracking-[0.4em] uppercase mb-2">
            Rejoindre l'aventure
          </p>
          <p className="font-body text-zinc-400 text-sm mb-6 leading-relaxed">
            Intéressé à devenir partenaire de LAN Gaming 2026 ? Tiers Diamant
            (5 000$+), Or (2 000$+), Argent (500$+), Bronze.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/partenariat.pdf"
              download="Partenariat-LAN-Gaming-2026.pdf"
              className="inline-flex items-center gap-2 font-mono text-xs text-ember-400 border border-ember-400/30 px-5 py-2.5 hover:border-ember-400 hover:text-ember-300 hover:bg-ember-400/5 transition-all duration-300"
            >
              <Download size={13} /> Dossier partenariat (PDF)
            </a>
            <a
              href="mailto:comiteetuinfo@cegepstfe.ca"
              className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 border border-zinc-800 px-5 py-2.5 hover:border-zinc-600 hover:text-zinc-300 transition-all duration-300"
            >
              <Mail size={13} /> comiteetuinfo@cegepstfe.ca
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
