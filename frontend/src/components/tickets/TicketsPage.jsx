import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { fadeInUp } from "../../utils/animation.js";

const pricingTiers = [
  {
    title: "Billet Visiteur",
    price: "15 $",
    desc: "Accès au site pour profiter de l'ambiance et des arcades.",
    features: [
      "Accès aux zones libres",
      "Consoles en libre-service",
      "Stands partenaires",
    ],
    color: "border-blue-500",
    shadow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
  },
  {
    title: "Billet Joueur",
    price: "30 $",
    desc: "Accès standard pour installer votre setup.",
    features: [
      "1 Emplacement PC (Place Centrale)",
      "Réseau LAN Haute Vitesse",
      "Jeux libres 24/7",
    ],
    color: "border-[#C89B3C]",
    shadow: "shadow-[0_0_15px_rgba(200,155,60,0.3)]",
    popular: true,
  },
  {
    title: "Passeport Compétiteur",
    price: "50 $",
    desc: "L'expérience Grind ultime.",
    features: [
      "Tous les avantages Joueur",
      "Inscription aux Tournois",
      "Éligible aux Cash Prizes",
    ],
    color: "border-red-500",
    shadow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
  },
];

export default function TicketsPage() {
  const { user } = useAuth();

  useEffect(() => {
    const scriptId = "lpdv-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://lepointdevente.com/plugins/widget.js?event=530135&lang=fr";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 min-h-screen pb-20 flex flex-col items-center relative"
    >
      <h1 className="text-5xl font-black text-white uppercase mb-4 text-center tracking-widest">
        Sécurisez votre <span className="text-[#FFD700]">Accès</span>
      </h1>
      <p className="text-gray-400 mb-12 max-w-2xl text-center px-4">
        Sélectionnez votre grade pour l'événement. L'achat de billets se fait de
        manière sécurisée via notre partenaire officiel.
      </p>

      {user ? (
        <div className="w-full max-w-5xl bg-[#0D1117] border border-[#C89B3C]/50 p-6 rounded mb-16 flex flex-col md:flex-row justify-between items-center shadow-[0_0_15px_rgba(200,155,60,0.3)]">
          <div>
            <h3 className="text-xl text-white font-bold tracking-widest uppercase">
              Profil : <span className="text-[#FFD700]">{user.name}</span>
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Connecté via système sécurisé.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-12 text-center text-[#C89B3C] text-sm uppercase tracking-widest animate-pulse">
          Connectez-vous via la barre de navigation avant l'achat.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl w-full px-6">
        {pricingTiers.map((tier, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            transition={{ delay: index * 0.1 }}
            className={`relative bg-[#030508] border ${tier.color} ${tier.shadow} p-8 flex flex-col ${tier.popular ? "transform lg:-translate-y-4" : ""}`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#C89B3C] text-[#030508] font-bold text-xs px-4 py-1 uppercase tracking-widest">
                Le Choix des Joueurs
              </div>
            )}
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              {tier.title}
            </h2>
            <div className="text-4xl font-bold text-white mt-4 mb-2">
              {tier.price}
            </div>
            <p className="text-gray-400 text-sm mb-6 h-12">{tier.desc}</p>
            <ul className="space-y-3 mb-8 flex-grow">
              {tier.features.map((feat, i) => (
                <li key={i} className="flex items-center text-gray-300 text-sm">
                  <span
                    className={`mr-3 ${tier.color.replace("border-", "text-")}`}
                  >
                    ✓
                  </span>{" "}
                  {feat}
                </li>
              ))}
            </ul>
            <a
              target="_blank"
              href="https://lepointdevente.com/billets/530135"
              className={`block text-center py-4 w-full font-bold uppercase tracking-widest transition-colors clip-diagonal ${tier.popular ? "bg-[#C89B3C] text-[#030508] hover:bg-[#FFD700]" : "bg-transparent border border-gray-600 text-white hover:border-[#C89B3C]"}`}
            >
              Sélectionner
            </a>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}
