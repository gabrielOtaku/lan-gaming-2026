import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Shield, Star, ChevronRight, ExternalLink, Lock, AlertTriangle } from 'lucide-react';
import { modalBackdrop, modalPanel, EASE_GAME } from '../../utils/animations.js';
import { getTicketRedirect } from '../../utils/api.js';

const TICKET_TYPES = [
  {
    id: 'visiteur',
    label: 'Visiteur',
    subtitle: 'Venir encourager',
    price: '15$',
    priceNote: '+ taxes',
    color: '#4FC3F7',
    features: [
      'Accès libre à l\'événement (47h)',
      'Zone spectateurs & consoles',
      'Suivi des tournois sur grands écrans',
      'Accès kiosques partenaires',
      'Arcade & jeux libres',
    ],
    icon: '👁️',
    popular: false,
  },
  {
    id: 'joueur',
    label: 'Joueur',
    subtitle: 'Accès LAN complet',
    price: '30$',
    priceNote: '+ taxes',
    color: '#C89B3C',
    features: [
      'Poste LAN fixe assigné (47h)',
      'Accès toutes les arènes gaming',
      'Badge joueur officiel',
      'Wi-Fi haute performance dédié',
      'Zone repos sécurisée 24h/24',
      '17 ans et plus requis',
    ],
    icon: '⚔️',
    popular: false,
  },
  {
    id: 'competiteur',
    label: 'Compétiteur',
    subtitle: 'Pour viser le trophée',
    price: '50$',
    priceNote: '+ taxes',
    color: '#FFD700',
    features: [
      'Tout du Joueur inclus',
      'Inscription aux tournois officiels',
      'LoL · CS2 · Rocket League · Magic:TG',
      'Super Smash Bros · Mario Kart',
      'Éligible aux cash prizes',
      'Badge Compétiteur exclusif',
    ],
    icon: '👑',
    popular: true,
  },
];

// ── Ticket card ───────────────────────────────────────────────────────────────
function TicketCard({ ticket, isSelected, onSelect, remaining }) {
  const soldOut = typeof remaining === 'number' && remaining <= 0;
  const lowStock = typeof remaining === 'number' && remaining > 0 && remaining <= 5;

  return (
    <motion.div
      className={`relative ${soldOut ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={() => !soldOut && onSelect(ticket.id)}
      whileHover={!soldOut ? { scale: 1.02 } : {}}
      whileTap={!soldOut ? { scale: 0.98 } : {}}
    >
      {ticket.popular && !soldOut && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="px-3 py-0.5 bg-ember-300 text-obsidian-900 font-display font-bold text-[10px] tracking-widest uppercase">
            ★ Populaire
          </div>
        </div>
      )}
      {soldOut && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="px-3 py-0.5 bg-red-500 text-white font-display font-bold text-[10px] tracking-widest uppercase">
            Épuisé
          </div>
        </div>
      )}

      <div
        className={`relative p-5 md:p-6 border h-full transition-all duration-200 ${isSelected && !soldOut ? 'bg-glass' : 'bg-obsidian-800'}`}
        style={{
          borderColor: soldOut ? 'rgba(255,70,85,0.3)' : isSelected ? ticket.color : 'rgba(255,255,255,0.06)',
          boxShadow: isSelected && !soldOut ? `0 0 30px ${ticket.color}20` : 'none',
        }}
      >
        <AnimatePresence>
          {isSelected && !soldOut && (
            <motion.div
              className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: ticket.color, background: `${ticket.color}20` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: ticket.color }} />
            </motion.div>
          )}
        </AnimatePresence>

        <span className="text-3xl block mb-3">{ticket.icon}</span>
        <p className="font-mono text-xs tracking-widest uppercase mb-1" style={{ color: `${ticket.color}80` }}>
          {ticket.subtitle}
        </p>
        <h4 className="font-display font-black text-xl mb-1" style={{ color: soldOut ? '#666' : isSelected ? ticket.color : 'white' }}>
          {ticket.label}
        </h4>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="font-display font-black text-3xl" style={{ color: soldOut ? '#555' : ticket.color }}>
            {ticket.price}
          </span>
          <span className="font-mono text-zinc-700 text-xs">{ticket.priceNote}</span>
        </div>

        {/* Seats indicator */}
        {typeof remaining === 'number' && !soldOut && (
          <div className={`mb-4 flex items-center gap-1.5 ${lowStock ? 'text-red-400' : 'text-zinc-600'}`}>
            {lowStock && <AlertTriangle size={10} />}
            <span className="font-mono text-[9px] tracking-widest uppercase">
              {lowStock ? `⚠ Seulement ${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}` : `${remaining} places disponibles`}
            </span>
          </div>
        )}

        <ul className="space-y-2">
          {ticket.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight size={12} className="flex-shrink-0 mt-0.5" style={{ color: soldOut ? '#555' : ticket.color }} />
              <span className={`font-body text-xs leading-relaxed ${soldOut ? 'text-zinc-700' : 'text-zinc-400'}`}>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ── Redirect confirmation modal ───────────────────────────────────────────────
function RedirectConfirm({ ticket, quantity, onConfirm, onCancel, loading, error }) {
  return (
    <motion.div
      variants={modalPanel}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-obsidian-800 border border-ember-400/20 p-6 md:p-8 max-w-md w-full mx-auto relative"
    >
      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-ember-400/40" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-ember-400/40" />

      <div className="text-center mb-6">
        <div className="w-16 h-16 clip-hex bg-ember-400/10 border border-ember-400/30 flex items-center justify-center mx-auto mb-4">
          <ExternalLink size={24} className="text-ember-300" />
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">Confirmer la commande</h3>
        <p className="font-body text-zinc-500 text-sm">
          Vous allez être redirigé vers la billetterie officielle du Cégep.
        </p>
      </div>

      <div className="bg-obsidian-900 border border-ember-400/10 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-zinc-500 text-xs">Type</span>
          <span className="font-display font-bold text-ember-300 text-sm">{ticket.label}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-zinc-500 text-xs">Quantité</span>
          <span className="font-body text-white text-sm">{quantity} billet{quantity > 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
          <span className="font-mono text-zinc-500 text-xs">Total estimé</span>
          <span className="font-display font-black text-ember-300">
            {(parseFloat(ticket.price) * quantity).toFixed(0)}$ + taxes
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-obsidian-900 border border-zinc-800">
        <Lock size={12} className="text-green-500 flex-shrink-0" />
        <p className="font-mono text-zinc-600 text-[10px] tracking-wide">
          Transaction sécurisée — billetterie officielle Cégep de Saint-Félicien
        </p>
      </div>

      {error && <p className="font-mono text-red-400 text-xs text-center mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-zinc-800 text-zinc-500 font-mono text-xs tracking-widest uppercase hover:border-zinc-600 transition-colors"
        >
          Annuler
        </button>
        <motion.button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 clip-diagonal bg-ember-400 text-obsidian-900 font-display font-bold text-xs tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-3 h-3 border border-obsidian-900 border-t-transparent rounded-full"
              />
              Chargement...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ExternalLink size={12} />
              Continuer →
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function TicketModal({ inventory, salesClosed }) {
  const [selectedType, setSelectedType] = useState('competiteur');
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedTicket = TICKET_TYPES.find(t => t.id === selectedType);
  const selectedRemaining = inventory?.[selectedType]?.remaining;

  const handleProceed = () => {
    setError(null);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTicketRedirect({ ticketType: selectedType, quantity, consent: true });
      window.open(res.redirectUrl, '_blank', 'noopener,noreferrer');
      setShowConfirm(false);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {TICKET_TYPES.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            isSelected={selectedType === ticket.id}
            onSelect={setSelectedType}
            remaining={inventory?.[ticket.id]?.remaining}
          />
        ))}
      </div>

      {salesClosed ? (
        <div className="border border-red-500/30 bg-red-500/5 p-5 text-center">
          <AlertTriangle size={20} className="text-red-400 mx-auto mb-2" />
          <p className="font-display font-bold text-red-300 text-sm tracking-wide">Billetterie fermée</p>
          <p className="font-body text-zinc-500 text-xs mt-1">La vente de billets est terminée pour l'édition 2026.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border border-ember-400/15 bg-glass p-5 md:p-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-zinc-500 text-xs tracking-widest uppercase">Quantité :</span>
            <div className="flex items-center gap-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 border border-zinc-800 text-zinc-400 font-bold hover:border-ember-400/50 hover:text-ember-300 transition-colors flex items-center justify-center"
              >
                −
              </button>
              <div className="w-12 h-9 border-t border-b border-zinc-800 flex items-center justify-center">
                <span className="font-mono text-white text-sm">{quantity}</span>
              </div>
              <button
                onClick={() => {
                  const max = typeof selectedRemaining === 'number' ? Math.min(10, selectedRemaining) : 10;
                  setQuantity(Math.min(max, quantity + 1));
                }}
                className="w-9 h-9 border border-zinc-800 text-zinc-400 font-bold hover:border-ember-400/50 hover:text-ember-300 transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-mono text-zinc-600 text-xs">Total estimé</p>
              <p className="font-display font-black text-2xl text-ember-300">
                {(parseFloat(selectedTicket?.price || '0') * quantity).toFixed(0)}$
              </p>
            </div>

            <motion.button
              onClick={handleProceed}
              className="relative px-8 py-3.5 clip-diagonal overflow-hidden group"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: ['0 0 15px rgba(200,155,60,0.3)', '0 0 40px rgba(255,215,0,0.6)', '0 0 15px rgba(200,155,60,0.3)'],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="absolute inset-0 bg-ember-400 group-hover:bg-ember-300 transition-colors" />
              <span className="relative font-display font-bold text-obsidian-900 text-sm tracking-widest uppercase flex items-center gap-2">
                <Zap size={14} />
                Acheter mes billets
              </span>
            </motion.button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
        {[
          { icon: Lock,   label: 'Paiement sécurisé' },
          { icon: Shield, label: 'Données protégées' },
          { icon: Star,   label: 'Billet officiel' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={12} className="text-zinc-700" />
            <span className="font-mono text-zinc-700 text-[10px] tracking-widest uppercase">{label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-obsidian-900/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
          >
            <RedirectConfirm
              ticket={selectedTicket}
              quantity={quantity}
              onConfirm={handleConfirm}
              onCancel={() => setShowConfirm(false)}
              loading={loading}
              error={error}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
