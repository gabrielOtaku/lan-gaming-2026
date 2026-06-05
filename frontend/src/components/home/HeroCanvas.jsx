import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

// Le système de particules 3D représentant le réseau LAN
const ParticleNetwork = (props) => {
  const ref = useRef();
  // Génère 500 points dans une sphère
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(1500), { radius: 1.5 }),
  );

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color="#c21f1f"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const HeroCanvas = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full bg-lanDark overflow-hidden flex items-center justify-center">
      {/* Le vrai Canvas 3D en arrière-plan */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleNetwork />
        </Canvas>
      </div>

      {/* Dégradé pour assombrir le bas et faire ressortir le texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-lanDark via-transparent to-transparent z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 text-center px-4 pointer-events-none"
      >
        <motion.h1
          className="text-6xl md:text-8xl font-gaming text-white uppercase tracking-widest drop-shadow-glow-gold"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          Cégep en LAN
        </motion.h1>
        <p className="mt-4 text-xl text-gray-300 font-sans uppercase tracking-widest">
          9 - 11 Octobre 2026 | Saint-Félicien
        </p>

        <motion.button
          onClick={() => navigate("/billetterie")}
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 0px 25px rgba(194, 31, 31, 0.8)",
          }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 px-8 py-4 bg-lanDark border border-lanAccent text-white font-gaming text-xl uppercase rounded shadow-glow-red transition-colors hover:bg-lanAccent pointer-events-auto"
        >
          Réserver ma place
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HeroCanvas;
