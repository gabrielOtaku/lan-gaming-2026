import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "../../utils/animation";

const BioConcept = () => {
  return (
    <section className="py-20 bg-black">
      {/* Section Galerie */}
      <h2 className="text-4xl font-gaming text-lanGold text-center mb-12">
        L'Héritage du Grind
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-6 mb-20">
        <img
          src="/images/lan-1.jpg"
          alt="Ambiance LAN"
          className="rounded border border-neutral-800 hover:border-lanAccent transition-all grayscale hover:grayscale-0 object-cover aspect-video"
        />
        <img
          src="/images/lan-2.jpg"
          alt="Tournoi"
          className="rounded border border-neutral-800 hover:border-lanAccent transition-all grayscale hover:grayscale-0 object-cover aspect-video"
        />
        <img
          src="/images/fondation.jpg"
          alt="Fondation du Cégep"
          className="rounded border border-neutral-800 hover:border-lanGold transition-all grayscale hover:grayscale-0 object-cover aspect-video"
        />
      </div>

      {/* Section Texte Origine */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-5xl mx-auto px-6 text-center relative z-10"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-gaming text-white mb-8"
        >
          L'Origine du{" "}
          <span className="text-lanAccent drop-shadow-glow-red">Grind</span>
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-lg text-gray-300 leading-relaxed mb-6 text-justify md:text-center"
        >
          Bien plus qu'un simple événement étudiant, le projet Cégep en LAN 2026
          est une immersion totale de 47 heures. C'est la célébration d'une
          passion commune, conçue par le comité étudiant pour rassembler
          l'ensemble de la communauté gaming.
        </motion.p>

        <motion.p
          variants={fadeInUp}
          className="text-lg text-gray-300 leading-relaxed text-justify md:text-center"
        >
          Avec un réseau en étoile haute performance, des tournois d'envergure
          sur League of Legends, CS2, Rocket League, et un bal d'ouverture
          spectaculaire, cette 10e édition repousse les limites de la
          compétition amateur. Préparez-vous pour l'événement historique de la
          région.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default BioConcept;
