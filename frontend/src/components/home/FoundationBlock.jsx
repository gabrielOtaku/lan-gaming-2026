import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function FoundationBlock() {
  return (
    <section className="relative py-24 md:py-40 overflow-hidden bg-[#030508]">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-red-400/60 text-xs tracking-[0.5em] uppercase mb-4">
            [ Partenaire caritatif officiel ]
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
            La{" "}
            <span
              style={{
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: "1px rgba(239,68,68,0.7)",
              }}
            >
              Fondation
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col items-center lg:items-start gap-6">
            <div className="w-24 h-24 clip-hex bg-gradient-to-br from-red-900 to-red-950 border border-red-900/40 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Heart
                size={36}
                className="text-red-400 fill-red-400 animate-pulse"
              />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
              Au-delà du gaming
            </h3>
            <p className="text-gray-400 leading-relaxed text-justify md:text-left">
              15% des revenus de l'événement sont versés directement à la
              Fondation du Cégep de Saint-Félicien. Chaque ticket acheté aide
              concrètement l'organisation académique et finance des bourses de
              persévérance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600"
              className="w-full h-48 object-cover rounded-sm border border-[#C89B3C]/30 filter grayscale hover:grayscale-0 transition-all duration-500"
            />
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600"
              className="w-full h-48 object-cover rounded-sm border border-[#C89B3C]/30 filter grayscale hover:grayscale-0 transition-all duration-500 translate-y-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
