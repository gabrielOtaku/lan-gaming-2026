import { motion } from "framer-motion";

const schedule = [
  {
    day: "Vendredi 9 Octobre",
    time: "19h00",
    event: "Ouverture des Portes",
    desc: "Installation du matériel (1 PC / 1 écran max) à la Place Centrale.",
  },
  {
    day: "Vendredi 9 Octobre",
    time: "19h30",
    event: "Bal d'Ouverture",
    desc: "Salle Azimut : Buffet, présentation des partenaires et lancement officiel.",
  },
  {
    day: "Vendredi 9 Octobre",
    time: "21h00",
    event: "Début du Grind 24/7",
    desc: "Lancement des phases de poules (LoL, CS2, Rocket League).",
  },
  {
    day: "Samedi 10 Octobre",
    time: "13h00",
    event: "Tournoi Tabletop",
    desc: "Zone dédiée : Magic The Gathering.",
  },
  {
    day: "Samedi 10 Octobre",
    time: "15h00",
    event: "Conférence Studio",
    desc: "Salle Azimut : Présentation exclusive d'un studio invité.",
  },
  {
    day: "Samedi 10 Octobre",
    time: "19h00",
    event: "Tournoi Console",
    desc: "Scène principale : Super Smash Bros et Mario Kart.",
  },
  {
    day: "Dimanche 11 Octobre",
    time: "11h30",
    event: "Grandes Finales",
    desc: "Matchs ultimes diffusés en direct sur Twitch au profit de la Fondation.",
  },
  {
    day: "Dimanche 11 Octobre",
    time: "13h30",
    event: "Cérémonie de Clôture",
    desc: "Couronnement des champions et annonce de la récolte de dons.",
  },
];

const Timeline = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-gaming text-center text-lanGold mb-16 drop-shadow-glow-gold"
      >
        Calendrier des Opérations
      </motion.h2>
      <div className="relative border-l border-lanAccent/50 ml-4 md:ml-0">
        {schedule.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="mb-10 pl-8 relative"
          >
            <div className="absolute w-4 h-4 bg-lanDark border-2 border-lanAccent rounded-full -left-[9px] top-1 shadow-glow-red"></div>
            <div className="flex flex-col md:flex-row md:items-baseline md:space-x-4 mb-2">
              <span className="text-lanGold font-gaming text-xl">
                {item.time}
              </span>
              <span className="text-gray-400 text-sm uppercase tracking-widest">
                {item.day}
              </span>
            </div>
            <h3 className="text-2xl text-white font-sans font-bold mb-2">
              {item.event}
            </h3>
            <p className="text-gray-300 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
