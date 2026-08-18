import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Monitor, Wifi, Zap, Utensils, Bed, ShieldCheck,
  Accessibility, ExternalLink, CheckCircle2, Clock,
} from 'lucide-react';
import { pageTransition, staggerContainer, fadeInUp, scrollReveal } from '../utils/animations.js';

// ── Statut "confirmé" vs "à valider" — reprend la légende du cahier des
// charges (§3) plutôt que de présenter des détails non confirmés comme réels.
function StatusBadge({ confirmed }) {
  return confirmed ? (
    <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border border-green-500/30 bg-green-500/10 text-green-400">
      <CheckCircle2 size={10} /> Confirmé
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border border-amber-500/30 bg-amber-500/10 text-amber-400">
      <Clock size={10} /> À valider
    </span>
  );
}

const CARDS = [
  {
    icon: MapPin, color: '#C89B3C', title: 'Lieu et accès', confirmed: true,
    body: '525, boul. Hamel, Saint-Félicien, QC G8K 2R8 — Cégep de Saint-Félicien.',
    extra: (
      <a
        href="https://maps.google.com/?q=Cégep+de+Saint-Félicien"
        target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ember-400 hover:text-ember-300 transition-colors mt-2"
      >
        Voir sur la carte <ExternalLink size={10} />
      </a>
    ),
  },
  {
    icon: Monitor, color: '#4FC3F7', title: 'Équipement à apporter', confirmed: true,
    body: 'Joueurs et compétiteurs apportent leur propre matériel : 1 PC + 1 écran maximum par personne, plus vos périphériques (clavier, souris, casque). Les visiteurs n\'ont rien à apporter.',
  },
  {
    icon: Wifi, color: '#7C3AED', title: 'Réseau', confirmed: true,
    body: 'Le réseau LAN est fourni sur place pour les joueurs et compétiteurs — vous n\'avez pas besoin d\'apporter votre propre connexion.',
  },
  {
    icon: ShieldCheck, color: '#22c55e', title: 'Âge et accompagnement', confirmed: true,
    body: 'Billets Joueur et Compétiteur : 17 ans et plus. Billet Visiteur : ouvert à tous, les mineurs doivent avoir l\'autorisation d\'un tuteur légal.',
  },
  {
    icon: Zap, color: '#FFD700', title: 'Électricité', confirmed: false,
    body: 'Nombre de prises par poste et politique sur les multiprises personnelles — à confirmer avec le Cégep avant l\'événement.',
  },
  {
    icon: Utensils, color: '#FF6B35', title: 'Restauration', confirmed: false,
    body: 'Des pauses repas sont prévues au programme (voir le Calendrier). Lieux précis, horaires détaillés et moyens de paiement restent à confirmer.',
  },
  {
    icon: Bed, color: '#4FC3F7', title: 'Hébergement', confirmed: false,
    body: 'Aucun partenariat hôtelier n\'est confirmé à ce jour. Si tu viens de l\'extérieur de la région, prévois ton hébergement — nous mettrons cette section à jour dès qu\'une entente sera signée.',
  },
  {
    icon: Accessibility, color: '#9B59B6', title: 'Accessibilité', confirmed: false,
    body: 'Ascenseurs, toilettes adaptées et accompagnement — informations officielles du Cégep à venir. Pour une demande spécifique, contacte-nous à l\'avance.',
  },
];

function InfoCard({ card, index }) {
  const Icon = card.icon;
  return (
    <motion.div
      variants={fadeInUp}
      className="border border-zinc-800 bg-obsidian-800/60 p-5 hover:border-zinc-700 transition-colors duration-300"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <Icon size={16} style={{ color: card.color }} />
          <h3 className="font-display text-white text-sm font-bold">{card.title}</h3>
        </div>
        <StatusBadge confirmed={card.confirmed} />
      </div>
      <p className="font-body text-zinc-500 text-sm leading-relaxed">{card.body}</p>
      {card.extra}
    </motion.div>
  );
}

export default function PracticalInfoPage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-32 md:pt-40 pb-24 px-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          [ Avant de venir ]
        </motion.p>
        <motion.h1
          className="font-display text-5xl md:text-6xl font-black uppercase leading-none mb-4"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
        >
          <span className="text-white">Infos</span>{' '}
          <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}>
            Pratiques
          </span>
        </motion.h1>
        <motion.p
          className="font-body text-zinc-500 text-sm max-w-xl mb-14"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          Tout ce qu'il faut savoir avant de te présenter au Cégep de Saint-Félicien. Les points
          marqués « à valider » seront confirmés et mis à jour au fur et à mesure.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {CARDS.map((card, i) => (
            <InfoCard key={card.title} card={card} index={i} />
          ))}
        </motion.div>

        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 border border-ember-400/15 bg-obsidian-800/60 p-6 text-center"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
        >
          <p className="font-body text-zinc-400 text-sm mb-3">
            Une question qui n'est pas couverte ici ?
          </p>
          <a
            href="mailto:comiteetuinfo@cegepstfe.ca"
            className="inline-flex items-center gap-2 font-mono text-xs text-ember-400 border border-ember-400/30 px-5 py-2.5 hover:border-ember-400 hover:bg-ember-400/5 transition-all"
          >
            comiteetuinfo@cegepstfe.ca
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
