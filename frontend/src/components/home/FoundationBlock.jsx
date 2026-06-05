import { motion } from "framer-motion";

const FoundationBlock = () => {
  return (
    <section className="py-20 bg-neutral-900 border-t border-lanGold/20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-gaming text-lanGold mb-6">
            Partenaire Caritatif Officiel
          </h2>
          <p className="text-gray-300 mb-4 leading-relaxed">
            Nous sommes fiers de compter la Fondation du Cégep de Saint-Félicien
            comme notre partenaire institutionnel[cite: 19]. La mission de la
            Fondation est d'appuyer financièrement la population étudiante.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Chaque année, elle distribue entre 30 000 $ et 50 000 $ en
            bourses[cite: 22]. Tous les dons récoltés lors de notre diffusion
            Twitch seront 100% reversés à la Fondation.
          </p>
        </motion.div>

        {/* Graphique ou Logo stylisé */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="h-64 border border-lanGold/50 rounded-lg shadow-glow-gold flex items-center justify-center bg-black/50"
        >
          <span className="text-lanGold font-gaming text-2xl">
            Fondation du Cégep
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default FoundationBlock;
