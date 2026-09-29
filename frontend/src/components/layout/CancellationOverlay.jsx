import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ExternalLink, X, CalendarX } from "lucide-react";
import { EVENT_CANCELLED, FONDATION_URL } from "../../config/eventStatus.js";

// Affiché une fois par session de navigation (sessionStorage) pour ne pas
// réapparaître à chaque page, mais revient à chaque nouvelle visite.
const STORAGE_KEY = "lan2026-cancellation-seen";

function alreadySeen() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* navigation privée / stockage bloqué : l'overlay réapparaîtra, sans gravité */
  }
}

export default function CancellationOverlay() {
  const [open, setOpen] = useState(() => EVENT_CANCELLED && !alreadySeen());
  const closeRef = useRef(null);

  const close = () => {
    markSeen();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cancellation-overlay"
          className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-obsidian-900/90 backdrop-blur-md cursor-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancellation-title"
          aria-describedby="cancellation-body"
        >
          <motion.div
            className="relative w-full max-w-lg bg-obsidian-800 border border-ember-400/30 p-6 sm:p-10 text-center shadow-[0_0_80px_rgba(200,155,60,0.15)]"
            style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              ref={closeRef}
              onClick={close}
              className="absolute top-4 right-4 text-zinc-500 hover:text-ember-300 transition-colors p-1"
              aria-label="Fermer l'annonce"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center border border-red-500/40 bg-red-500/10">
              <CalendarX size={26} className="text-red-400" />
            </div>

            <p className="font-mono text-red-400 text-[10px] tracking-[0.4em] uppercase mb-3">
              Annonce officielle
            </p>
            <h2 id="cancellation-title" className="font-display text-2xl sm:text-3xl font-black text-white uppercase leading-tight mb-5">
              Lan St-Jean 2026 est annulée
            </h2>

            <div id="cancellation-body" className="space-y-3 font-body text-zinc-400 text-sm leading-relaxed mb-8">
              <p>
                Nous avons le regret de vous annoncer que l'édition 2026, prévue du
                9 au 11 octobre au Cégep de Saint-Félicien, n'aura pas lieu cette année.
              </p>
              <p>
                Nous sommes sincèrement désolés pour le désagrément causé aux
                joueurs, visiteurs, partenaires et bénévoles qui nous ont fait
                confiance. Merci pour votre soutien et votre compréhension.
              </p>
              <p className="text-zinc-300">
                Vous souhaitez quand même soutenir la cause ? Vos dons restent
                précieux pour la Fondation du Cégep et ses bourses étudiantes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
              <a
                href={FONDATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={markSeen}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-ember-400 hover:bg-ember-300 text-obsidian-900 font-display font-bold text-xs tracking-widest uppercase transition-colors"
              >
                <Heart size={14} />
                Faire un don à la Fondation
                <ExternalLink size={12} />
              </a>
              <button
                onClick={close}
                className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
              >
                Continuer vers le site
              </button>
            </div>

            <p className="mt-6 font-mono text-zinc-600 text-[10px] tracking-wide">
              Questions : comiteetuinfo@cegepstfe.ca
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
