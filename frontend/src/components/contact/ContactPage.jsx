import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animation.js";

export default function ContactPage() {
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 min-h-screen pb-20 max-w-3xl mx-auto px-6"
    >
      <div className="text-center mb-12">
        <p className="text-[#C89B3C] text-xs tracking-[0.5em] uppercase mb-4">
          [ Support ]
        </p>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
          Service <span className="text-[#FFD700]">Après-Vente</span>
        </h1>
      </div>

      <motion.form
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        onSubmit={handleSubmit}
        className="bg-[#0D1117] border border-[#C89B3C]/20 p-8 shadow-[0_0_15px_rgba(200,155,60,0.3)]"
      >
        {status === "success" ? (
          <div className="text-center py-12 border border-green-500/30 bg-green-500/10 text-green-400 uppercase tracking-widest">
            Demande transmise avec succès à l'organisation.
          </div>
        ) : (
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Nom Complet"
              required
              className="w-full bg-[#030508] border border-gray-700 p-4 text-white focus:border-[#C89B3C] outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Adresse Courriel"
              required
              className="w-full bg-[#030508] border border-gray-700 p-4 text-white focus:border-[#C89B3C] outline-none transition-colors"
            />
            <textarea
              placeholder="Décrivez votre problème..."
              rows="6"
              required
              className="w-full bg-[#030508] border border-gray-700 p-4 text-white focus:border-[#C89B3C] outline-none transition-colors resize-none"
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#C89B3C] text-[#030508] font-bold tracking-widest uppercase hover:bg-[#FFD700] transition-colors clip-diagonal"
            >
              Envoyer la transmission
            </button>
            <p className="text-center text-gray-500 text-[10px] mt-4 uppercase tracking-widest">
              Ou contactez-nous directement à : comiteetuinfo@cegepstfe.ca
            </p>
          </div>
        )}
      </motion.form>
    </motion.div>
  );
}
