import React from "react";
import { motion } from "framer-motion";

const PARTNERS = [
  { name: "Intel", domain: "intel.com", color: "#0071C5", initial: "IN" },
  { name: "ASUS ROG", domain: "asus.com", color: "#ED1C24", initial: "ROG" },
  {
    name: "Logitech G",
    domain: "logitechg.com",
    color: "#00B8FC",
    initial: "LG",
  },
  {
    name: "Monster Energy",
    domain: "monsterenergy.com",
    color: "#2ECC40",
    initial: "ME",
  },
  { name: "Ubisoft", domain: "ubisoft.com", color: "#0584C7", initial: "UBI" },
  { name: "NVIDIA", domain: "nvidia.com", color: "#76B900", initial: "NV" },
];

export default function Sponsors() {
  const doubled = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="relative py-20 overflow-hidden bg-[#0D1117] border-y border-[#C89B3C]/20">
      <div className="text-center mb-12 relative z-10">
        <p className="text-[#C89B3C] text-xs tracking-[0.5em] uppercase mb-4">
          [ Nos alliés ]
        </p>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
          Nos <span className="text-[#FFD700]">Partenaires</span>
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0D1117] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0D1117] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center py-6 gap-16 px-8"
          animate={{ x: [0, `-${100 / 3}%`] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((partner, i) => (
            <motion.div
              key={i}
              className="w-24 h-24 rounded-sm border border-[#C89B3C]/30 flex items-center justify-center bg-[#030508] relative group overflow-hidden"
              whileHover={{
                scale: 1.1,
                borderColor: partner.color,
                boxShadow: `0 0 20px ${partner.color}50`,
              }}
            >
              <img
                src={`https://logo.clearbit.com/${partner.domain}`}
                alt={partner.name}
                className="w-14 h-14 object-contain relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="hidden text-xl text-white font-bold z-10 relative">
                {partner.initial}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
