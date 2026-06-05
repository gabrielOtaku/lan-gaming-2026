import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, slideInRight } from "../../utils/animation";

const mapData = [
  {
    // <-- Il manquait cette accolade
    id: "azimut",
    title: "Salle Azimut",
    subtitle: "Le Hub Principal",
    description:
      "C'est ici que tout commence. La Salle Azimut accueille le majestueux bal d'ouverture, le buffet, les stands de nos partenaires, et la grande scène pour la conférence exclusive du studio de jeux vidéo invité.",
    features: [
      "Scène de diffusion Twitch",
      "Stands Partenaires",
      "Zone Conférence",
    ],
    color: "border-lanGold",
    shadow: "shadow-glow-gold",
  },
  {
    // <-- Il manquait cette accolade
    id: "centrale",
    title: "Place Centrale (Étage 1 & 2)",
    subtitle: "Le Cœur du Grind",
    description:
      "L'arène de combat principale. Sur deux étages, cet espace est optimisé pour accueillir le setup de chaque joueur avec un réseau en étoile ultra-rapide. C'est ici que se déroulent les tournois intenses 24/7.",
    features: ["Connexion LAN 10G", "Café Nommad", "Écrans de rediffusion"],
    color: "border-lanAccent",
    shadow: "shadow-glow-red",
  },
  {
    // <-- Il manquait cette accolade
    id: "gymnase",
    title: "Le Gymnase",
    subtitle: "Zone de Repos Sécurisée",
    description:
      "Parce que le repos est essentiel dans un marathon de 47 heures, le gymnase est transformé en dortoir supervisé. Totalement isolé du bruit de l'événement, il permet aux joueurs de recharger leurs batteries.",
    features: [
      "Accès sécurisé 24/7",
      "Isolement acoustique",
      "Proximité des douches",
    ],
    color: "border-blue-500",
    shadow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
  },
];

const MapOverlay = () => {
  const [activeZone, setActiveZone] = useState(mapData[1]);

  return (
    <section className="py-20 bg-black relative border-t border-lanDark">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-gaming text-white uppercase tracking-widest mb-4">
            Cartographie du <span className="text-lanAccent">Cégep</span>
          </h2>
          <p className="text-gray-400 font-sans">
            Sélectionnez une zone pour découvrir ses spécifications tactiques.
          </p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Menu latéral */}
          <div className="flex flex-col space-y-4 lg:w-1/3">
            {mapData.map((zone) => (
              <motion.button
                key={zone.id}
                onClick={() => setActiveZone(zone)}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-6 rounded bg-neutral-900 border-l-4 transition-all duration-300 ${
                  activeZone.id === zone.id
                    ? `${zone.color} ${zone.shadow} bg-neutral-800`
                    : "border-transparent hover:border-gray-600"
                }`}
              >
                <h3
                  className={`font-gaming text-xl ${activeZone.id === zone.id ? "text-white" : "text-gray-400"}`}
                >
                  {zone.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">
                  {zone.subtitle}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Détails de la zone */}
          <div className="lg:w-2/3 relative min-h-[400px] bg-neutral-900 rounded-lg border border-neutral-800 p-8 overflow-hidden">
            <div
              className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 ${activeZone.id === "centrale" ? "bg-lanAccent" : activeZone.id === "azimut" ? "bg-lanGold" : "bg-blue-500"}`}
            ></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeZone.id}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                variants={slideInRight}
                className="relative z-10"
              >
                <h3 className="text-3xl font-gaming text-white mb-2 drop-shadow-md">
                  {activeZone.title}
                </h3>
                <span className="inline-block px-3 py-1 mb-6 text-xs font-bold uppercase tracking-widest rounded bg-black text-gray-300 border border-neutral-700">
                  {activeZone.subtitle}
                </span>
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  {activeZone.description}
                </p>
                <div>
                  <h4 className="text-lanGold font-gaming tracking-widest mb-4">
                    Infrastructures clés :
                  </h4>
                  <ul className="space-y-3">
                    {activeZone.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="flex items-center text-gray-300"
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-3 ${activeZone.id === "centrale" ? "bg-lanAccent" : activeZone.id === "azimut" ? "bg-lanGold" : "bg-blue-500"}`}
                        ></span>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapOverlay;
