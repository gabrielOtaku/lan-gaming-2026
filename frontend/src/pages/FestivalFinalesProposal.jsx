import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Users, Heart, Handshake, MapPin, ShieldAlert } from 'lucide-react';
import { pageTransition, staggerContainer, fadeInUp, scrollReveal } from '../utils/animations.js';

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

const SEQUENCE = [
  { time: 'Matin — jusqu\'à 11h / 11h30', phase: 'Fin de la phase LAN', detail: 'Dernières activités, fermeture progressive, clarification des finalistes.' },
  { time: '11h / 11h30 à 16h', phase: 'Pause technique et humaine', detail: 'Repos, repas, douche, déplacement à l\'hôtel; rangement, nettoyage, reconfiguration, balances et tests.' },
  { time: '16h – 21h', phase: 'Festival des Finales', detail: 'Réouverture au public, animations, interviews, shows, finales, remise des prix et clôture.' },
];

const CONTENT_ITEMS = [
  'Réouverture de la place centrale dans une configuration orientée spectacle',
  'Billetterie visiteurs / accès grand public à étudier selon capacité et sécurité',
  'Bars et restauration, selon les politiques et partenaires autorisés par le Cégep',
  'Présentation des équipes finalistes et séquences d\'interviews',
  'Finales de Rocket League, Counter-Strike 2 et League of Legends',
  'Interventions artistiques courtes entre certaines séquences, selon ententes',
  'Remise des trophées, photos officielles, mot de la Fondation et clôture',
  'Production Twitch renforcée — compte à rebours, transitions, interviews, "main event"',
];

const BENEFITS = [
  {
    icon: Users, color: '#C89B3C', title: 'Participants & finalistes',
    items: [
      'Une vraie coupure pour manger, dormir, se laver, se changer',
      'Finales disputées dans de meilleures conditions',
      'Les finalistes ne terminent pas dans un espace qui se vide',
      'Cérémonie de remise des prix plus marquante',
    ],
  },
  {
    icon: ShieldAlert, color: '#4FC3F7', title: 'Organisateurs & Cégep',
    items: [
      'Fenêtre pour nettoyer, ranger, reconfigurer, tester',
      'Séparation claire entre phase "LAN" et phase "spectacle"',
      'Meilleure maîtrise de l\'expérience partenaires/public',
      'Contenu institutionnel plus fort après l\'événement',
    ],
  },
  {
    icon: Heart, color: '#FF4655', title: 'Fondation',
    items: [
      'Rassemblement avec un public plus large',
      'Meilleure visibilité de la mission caritative',
      'Potentiel accru pour les dons Twitch et sur place',
      'Moment central pour impliquer médias et partenaires',
    ],
  },
  {
    icon: Handshake, color: '#7C3AED', title: 'Partenaires & Saint-Félicien',
    items: [
      'Public concentré pour les séquences les plus visibles',
      'Meilleure qualité photos/vidéos/activation de marque',
      'Peut attirer des visiteurs spécifiquement pour les finales',
      'Image forte pour promouvoir une édition suivante',
    ],
  },
];

const CONSTRAINTS = [
  { concern: 'Fatigue des organisateurs et participants', response: 'Pause de 4 à 5 heures; fin des matchs officiels plus tôt le samedi; hébergement partenaire; équipes en rotation.' },
  { concern: 'Participants qui doivent repartir / travailler / étudier', response: 'La soirée finale ne doit pas empêcher un non-finaliste de quitter plus tôt; horaires communiqués avant la billetterie.' },
  { concern: 'Coût des agents de sécurité', response: 'Chiffrage précis du surcoût; évaluer si revenus visiteurs/commandites peuvent compenser.' },
  { concern: 'Entretien et remise en état des lieux', response: 'Utiliser la pause de mi-journée pour un nettoyage complet; équipe dédiée à la fermeture de 21h.' },
  { concern: 'Risque de dépassement d\'horaire', response: 'Conducteur minute par minute, marges de transition, format de finales compatible avec la fenêtre.' },
  { concern: 'Complexité technique', response: 'Tester scène, réseau, électricité et régie avant l\'ouverture; simplifier les changements de configuration.' },
  { concern: 'Capacité du public', response: 'Billetterie visiteurs limitée à la capacité validée; contrôle des accès et zones définies.' },
  { concern: 'Droits musicaux et diffusion', response: 'Inclure captation/Twitch dans les ententes artistes; finaliser les licences avant l\'événement.' },
];

const DECISIONS = [
  'Le Cégep accepte-t-il d\'étudier formellement le principe d\'une pause le dimanche suivie d\'une soirée de finales jusqu\'à environ 21h ?',
  'Quelles sont les limites non négociables liées à la sécurité, au personnel, au ménage et à l\'accès aux bâtiments ?',
  'Quelle capacité maximale peut être retenue pour la place centrale et l\'espace visiteurs ?',
  'Une billetterie visiteurs spécifique aux finales peut-elle être étudiée ?',
  'Quelles conditions doivent être remplies pour autoriser une scène/animation artistique dans la place centrale ?',
  'Quel budget et quelles ressources institutionnelles peuvent réellement être engagés ?',
  'Quelle gouvernance doit être retenue pour la sécurité, la technique, Twitch et la programmation ?',
  'Quel calendrier de validation doit être respecté pour lancer la billetterie et les teasers sans risque ?',
];

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-ember-500 text-[10px] tracking-[0.4em] uppercase mb-4">
      [ {children} ]
    </p>
  );
}

export default function FestivalFinalesProposal() {
  useNoIndex();

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
          <p className="font-body text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Interrompre la phase LAN du dimanche en fin de matinée, offrir une vraie période de
            repos, puis rouvrir en fin d'après-midi pour une soirée de grandes finales pensée
            comme un véritable « main event ». Objectif : concilier le besoin de repos du Cégep
            avec une clôture à la hauteur de l'importance sportive et médiatique des finales.
          </p>
        </motion.div>

        {/* ── Sequence ── */}
        <div className="mt-16">
          <SectionLabel>Séquence indicative</SectionLabel>
          <div className="border border-zinc-800 divide-y divide-zinc-800">
            {SEQUENCE.map((s, i) => (
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
            {CONTENT_ITEMS.map((item) => (
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
            {BENEFITS.map(({ icon: Icon, color, title, items }) => (
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
            ))}
          </div>
        </div>

        {/* ── Constraints & mitigation ── */}
        <div className="mt-16">
          <SectionLabel>Contraintes anticipées et pistes de mitigation</SectionLabel>
          <div className="border border-zinc-800 divide-y divide-zinc-800">
            {CONSTRAINTS.map((c, i) => (
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
              Présenter la soirée finale comme une option conditionnelle : elle ne doit être
              retenue que si le budget sécurité, les ressources humaines, la capacité, le
              nettoyage et les contraintes techniques peuvent être couverts de manière réaliste.
            </p>
          </div>
        </div>

        {/* ── Decisions needed ── */}
        <div className="mt-16">
          <SectionLabel>Décisions à préparer avec le Cégep</SectionLabel>
          <ol className="space-y-3">
            {DECISIONS.map((d, i) => (
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
            Si le concept est jugé intéressant en réunion, l'étape suivante n'est pas de
            l'annoncer publiquement, mais de produire un mini-plan de faisabilité : sécurité,
            personnel, capacité, budget, scénario de repli et horaire détaillé — avant toute
            mise à jour du calendrier public ou de la billetterie.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}
