import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { fadeInUp } from "../../utils/animation";

const TicketsPage = () => {
  const { user } = useAuth();

  // Injection dynamique du script LePointDeVente
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

  const pricingTiers = [
    {
      title: "Billet Visiteur",
      price: "15 $",
      desc: "Accès au site pour profiter de l'ambiance et des arcades.",
      features: [
        "Accès aux zones libres",
        "Consoles en libre-service",
        "Arcades",
        "Stands partenaires",
      ],
      color: "border-blue-500",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
    },
    {
      title: "Billet Joueur",
      price: "30 $",
      desc: "Accès standard pour installer votre setup et jouer tout le week-end.",
      features: [
        "1 Emplacement PC (Place Centrale)",
        "Réseau LAN Haute Vitesse",
        "Accès au dortoir (Gymnase)",
        "Jeux libres 24/7",
      ],
      color: "border-lanAccent",
      shadow: "shadow-glow-red",
      popular: true, // Mettra ce bloc en valeur au centre
    },
    {
      title: "Passeport Compétiteur",
      price: "50 $",
      desc: "L'expérience Grind ultime avec inscription aux tournois majeurs.",
      features: [
        "Tous les avantages Joueur",
        "Inscription aux Tournois",
        "Éligible aux Cash Prizes",
        "Placement VIP",
      ],
      color: "border-lanGold",
      shadow: "shadow-glow-gold",
    },
  ];

  return (
    <main className="pt-32 min-h-screen pb-20 flex flex-col items-center relative overflow-hidden">
      {/* Effet de lueur rouge en arrière-plan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-lanAccent/10 rounded-full blur-[150px] pointer-events-none"></div>

      <h1 className="text-5xl font-gaming text-lanGold mb-4 text-center drop-shadow-glow-gold relative z-10">
        Sécurisez votre Accès
      </h1>
      <p className="text-gray-300 mb-12 max-w-2xl text-center px-4 relative z-10">
        Sélectionnez votre grade pour l'événement. L'achat de billets se fait de
        manière sécurisée via notre partenaire officiel.
      </p>

      {/* Interface Utilisateur Connecté */}
      {user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl bg-neutral-900 border border-lanAccent/50 p-6 rounded-lg mb-16 shadow-glow-red relative z-10 flex flex-col md:flex-row justify-between items-center"
        >
          <div>
            <h3 className="text-xl font-gaming text-white">
              Profil : <span className="text-lanAccent">{user.name}</span>
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Authentifié via {user.provider}.
            </p>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-3 bg-black border border-neutral-700 rounded text-gray-500 font-sans text-sm">
            Statut : Aucune réservation active détectée.
          </div>
        </motion.div>
      ) : (
        <div className="mb-12 text-center relative z-10">
          <p className="text-lanAccent text-sm uppercase tracking-widest mb-2 font-bold animate-pulse">
            Connectez-vous via la barre de navigation avant l'achat.
          </p>
        </div>
      )}

      {/* Grille des Tarifs (Passage à 3 colonnes) */}
      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl w-full px-6 relative z-10">
        {pricingTiers.map((tier, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            /* On ajoute un effet de surélévation (translate-y) pour le ticket populaire */
            className={`relative bg-black border ${tier.color} ${tier.shadow} p-8 rounded-lg flex flex-col ${tier.popular ? "transform lg:-translate-y-4 bg-neutral-900/50" : ""}`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-lanAccent text-white font-gaming text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-glow-red">
                Le Choix des Joueurs
              </div>
            )}

            <h2 className="text-2xl font-gaming text-white uppercase">
              {tier.title}
            </h2>
            <div className="text-4xl font-sans font-bold text-white mt-4 mb-2">
              {tier.price}
            </div>
            <p className="text-gray-400 text-sm mb-6 h-12">{tier.desc}</p>

            <ul className="space-y-3 mb-8 flex-grow">
              {tier.features.map((feat, i) => (
                <li key={i} className="flex items-center text-gray-300 text-sm">
                  {/* Coche colorée selon la couleur du bloc */}
                  <span
                    className={`mr-3 ${tier.color.replace("border-", "text-")}`}
                  >
                    ✓
                  </span>{" "}
                  {feat}
                </li>
              ))}
            </ul>

            {/* Le lien est intercepté par le widget LePointDeVente grâce au script */}
            <a
              href="https://lepointdevente.com/billets/530135"
              className={`block text-center py-4 w-full font-gaming uppercase tracking-widest transition-colors ${tier.popular ? "bg-lanAccent text-white hover:bg-red-700" : "bg-transparent border border-gray-600 text-white hover:border-white"}`}
            >
              Sélectionner
            </a>
          </motion.div>
        ))}
      </div>
    </main>
  );
};

export default TicketsPage;
