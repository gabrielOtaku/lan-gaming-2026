import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Clock, Users, Heart, Handshake, MapPin, ShieldAlert } from 'lucide-react';
import { pageTransition, staggerContainer, fadeInUp, scrollReveal } from '../utils/animations.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getFestivalFinalesProposal } from '../utils/api.js';

// ── Document interne — non lié dans la navigation publique. Empêche
// l'indexation moteur au montage (le <meta robots> global du site est
// "index, follow" pour tout le SPA, donc on le surcharge ici).
function useNoIndex() {
  useEffect(() => {
    const tag = document.createElement('meta');
    tag.name = 'robots';
    tag.content = 'noindex, nofollow';
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
}

// Icônes servies par nom (string) depuis l'API — voir backend/routes/api.js.
const BENEFIT_ICONS = { Users, ShieldAlert, Heart, Handshake };

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-ember-500 text-[10px] tracking-[0.4em] uppercase mb-4">
      [ {children} ]
    </p>
  );
}

export default function FestivalFinalesProposal() {
  // Un noindex n'est pas une protection (plan de mise en ligne V1 §1) —
  // cette page interne exige une vraie session admin, comme /admin. Le
  // contenu lui-même (SEQUENCE, CONSTRAINTS, DECISIONS...) ne vit plus dans
  // ce composant : il est chargé depuis un endpoint requireAdmin une fois la
  // session confirmée, pour qu'aucun visiteur non-admin ne le télécharge
  // jamais via le bundle JS — un garde côté rendu seul ne l'empêchait pas.
  const { isAdmin } = useAuth();
  useNoIndex();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    getFestivalFinalesProposal()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-28 md:pt-36 pb-24 px-4 sm:px-6"
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Internal doc banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 border border-red-500/30 bg-red-500/5 px-4 py-3 mb-10"
        >
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="font-mono text-red-400 text-[11px] tracking-wide leading-relaxed">
            Document de travail interne — non public, non lié dans la navigation du site.
            Proposition à valider par le Cégep. Aucun élément ci-dessous n'est confirmé.
          </p>
        </motion.div>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionLabel>Proposition — Format du dimanche</SectionLabel>
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase leading-none mb-4">
            <span className="text-white">Festival</span>{' '}
            <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}>
              des Finales
            </span>
          </h1>
          {data && (
            <p className="font-body text-zinc-400 text-sm max-w-2xl leading-relaxed">
              {data.intro}
            </p>
          )}
        </motion.div>

        {error && (
          <p className="mt-8 font-mono text-red-400 text-xs">{error}</p>
        )}
        {!data && !error && (
          <p className="mt-8 font-mono text-zinc-600 text-xs tracking-widest uppercase">Chargement…</p>
        )}

        {data && (
          <>
            {/* ── Sequence ── */}
            <div className="mt-16">
              <SectionLabel>Séquence indicative</SectionLabel>
              <div className="border border-zinc-800 divide-y divide-zinc-800">
                {data.sequence.map((s, i) => (
                  <motion.div
                    key={s.time}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-6 p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Clock size={13} className="text-ember-500" />
                      <span className="font-mono text-ember-400 text-xs tracking-wide">{s.time}</span>
                    </div>
                    <div>
                      <p className="font-display text-white font-bold text-sm mb-1">{s.phase}</p>
                      <p className="font-body text-zinc-500 text-sm leading-relaxed">{s.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Content potential ── */}
            <div className="mt-16">
              <SectionLabel>Contenu potentiel de la soirée</SectionLabel>
              <motion.div
                variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="grid sm:grid-cols-2 gap-2"
              >
                {data.contentItems.map((item) => (
                  <motion.div key={item} variants={fadeInUp} className="flex items-start gap-2.5 py-2">
                    <span className="text-ember-500 mt-1 text-xs flex-shrink-0">◆</span>
                    <span className="font-body text-zinc-400 text-sm leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── Benefits by stakeholder ── */}
            <div className="mt-16">
              <SectionLabel>Pourquoi ce format mérite d'être étudié</SectionLabel>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.benefits.map(({ icon, color, title, items }) => {
                  const Icon = BENEFIT_ICONS[icon] || Users;
                  return (
                    <motion.div
                      key={title}
                      variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      className="border border-zinc-800 bg-obsidian-800/60 p-5"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <Icon size={15} style={{ color }} />
                        <p className="font-display text-white font-bold text-sm">{title}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="font-body text-zinc-500 text-xs leading-relaxed pl-3 relative before:content-['—'] before:absolute before:left-0 before:text-zinc-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Constraints & mitigation ── */}
            <div className="mt-16">
              <SectionLabel>Contraintes anticipées et pistes de mitigation</SectionLabel>
              <div className="border border-zinc-800 divide-y divide-zinc-800">
                {data.constraints.map((c, i) => (
                  <motion.div
                    key={c.concern}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="grid sm:grid-cols-2 gap-1 sm:gap-6 p-4"
                  >
                    <p className="font-mono text-red-400/90 text-xs tracking-wide leading-relaxed">{c.concern}</p>
                    <p className="font-body text-zinc-500 text-xs leading-relaxed">{c.response}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="font-mono text-amber-500 text-[10px] tracking-widest uppercase mb-1.5">Position recommandée</p>
                <p className="font-body text-zinc-400 text-sm leading-relaxed">
                  {data.recommendedPosition}
                </p>
              </div>
            </div>

            {/* ── Decisions needed ── */}
            <div className="mt-16">
              <SectionLabel>Décisions à préparer avec le Cégep</SectionLabel>
              <ol className="space-y-3">
                {data.decisions.map((d, i) => (
                  <motion.li
                    key={d}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="font-mono text-ember-500 text-xs font-bold flex-shrink-0 mt-0.5 w-5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-body text-zinc-400 text-sm leading-relaxed">{d}</span>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* ── Next step ── */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mt-16 border border-ember-400/20 bg-obsidian-800/60 p-6"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <MapPin size={15} className="text-ember-400" />
                <p className="font-display text-ember-300 font-bold text-sm">Prochaine étape proposée</p>
              </div>
              <p className="font-body text-zinc-400 text-sm leading-relaxed">
                {data.nextStep}
              </p>
            </motion.div>
          </>
        )}

      </div>
    </motion.div>
  );
}
