import { motion } from "framer-motion";

const Loader = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-lanDark"
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      <motion.div className="w-32 h-32 border-4 border-lanDark border-t-lanAccent border-r-lanGold rounded-full animate-spin" />
      <motion.h2
        className="mt-8 text-3xl font-gaming text-lanGold tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
      >
        Initialisation du Réseau...
      </motion.h2>
    </motion.div>
  );
};

export default Loader;
