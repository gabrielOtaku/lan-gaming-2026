import { motion } from "framer-motion";

const Sponsors = () => {
  // Liste des partenaires officiels
  const partners = [
    "Metro",
    "Centre Hi-Fi",
    "Mazda",
    "e-distribution",
    "Desjardins",
    "Hôtel du Jardin",
    "Baye Traiteur",
    "Apple",
    "Ubisoft",
  ];

  return (
    <section className="py-12 bg-black border-y border-lanGold/20 overflow-hidden">
      <h3 className="text-center font-gaming text-lanGold mb-8 text-xl tracking-widest">
        Nos Commanditaires Officiels
      </h3>
      <div className="relative flex whitespace-nowrap">
        <motion.div
          className="flex items-center space-x-16 px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
        >
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-20 px-8 bg-neutral-900 rounded border border-neutral-800 shadow-lg"
            >
              <span className="text-2xl font-sans font-bold text-gray-500 uppercase tracking-wider">
                {partner}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Sponsors;
