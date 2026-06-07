import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

const mapData = [
  {
    id: "azimut",
    title: "Salle Azimut",
    subtitle: "Le Hub Principal",
    description: "C'est ici que tout commence.",
    features: ["Scène Twitch", "Stands", "Conférence"],
    color: "border-[#FFD700]",
    shadow: "shadow-[0_0_15px_rgba(200,155,60,0.3)]",
  },
  {
    id: "centrale",
    title: "Place Centrale",
    subtitle: "Le Cœur du Grind",
    description: "L'arène de combat principale.",
    features: ["Connexion LAN 10G", "Café Nommad", "Écrans de rediffusion"],
    color: "border-red-500",
    shadow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
  },
  {
    id: "gymnase",
    title: "Le Gymnase",
    subtitle: "Zone de Repos Sécurisée",
    description: "Dortoir supervisé et isolé.",
    features: [
      "Accès sécurisé 24/7",
      "Isolement acoustique",
      "Proximité douches",
    ],
    color: "border-blue-500",
    shadow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
  },
];

export default function MapOverlay() {
  const [activeZone, setActiveZone] = useState(mapData[1]);

  return (
    <section className="py-20 bg-transparent relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          <div className="flex flex-col space-y-4 lg:w-1/3">
            {mapData.map((zone) => (
              <motion.button
                key={zone.id}
                onClick={() => setActiveZone(zone)}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-6 rounded bg-[#0D1117] border-l-4 transition-all duration-300 ${
                  activeZone.id === zone.id
                    ? `${zone.color} ${zone.shadow} bg-[#030508]`
                    : "border-transparent hover:border-gray-600"
                }`}
              >
                <h3
                  className={`text-xl font-bold uppercase tracking-widest ${
                    activeZone.id === zone.id ? "text-white" : "text-gray-400"
                  }`}
                >
                  {zone.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">
                  {zone.subtitle}
                </p>
              </motion.button>
            ))}
          </div>
          <div className="lg:w-2/3 relative min-h-[400px] bg-[#030508] rounded-lg border border-gray-800 p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeZone.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">
                  {activeZone.title}
                </h3>
                <span className="inline-block px-3 py-1 mb-6 text-xs font-bold uppercase tracking-widest rounded bg-black text-gray-300 border border-gray-700">
                  {activeZone.subtitle}
                </span>
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  {activeZone.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Google Maps Iframe ── */}
        <div className="border border-[#C89B3C]/20 bg-[#0D1117]/50 p-2 rounded">
          <div className="flex items-center justify-between px-4 py-3 bg-[#030508] border-b border-[#C89B3C]/10 mb-2">
            <h3 className="text-[#FFD700] font-bold tracking-widest uppercase flex items-center gap-2">
              <MapPin size={16} /> Localisation Officielle
            </h3>
            <span className="text-gray-500 text-xs uppercase tracking-widest">
              525 Boul. Hamel, Saint-Félicien
            </span>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2629.897258385732!2d-72.4485584!3d48.6534571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cb9a1b15c4d32e9%3A0x6b77df2372d3df24!2sC%C3%A9gep%20de%20St-F%C3%A9licien!5e0!3m2!1sfr!2sca!4v1700000000000!5m2!1sfr!2sca"
            width="100%"
            height="400"
            style={{
              border: 0,
              filter: "invert(90%) hue-rotate(180deg) contrast(1.2)",
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-sm"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
