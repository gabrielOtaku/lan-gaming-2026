import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { FaTwitch, FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";

// Composant interactif 3D
const SocialNode = ({ position, color, gradientId, Icon, url, label }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={() => window.open(url, "_blank")}
      scale={hovered ? 1.2 : 1}
    >
      <octahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial
        color={hovered ? color : "#2a2a2a"}
        wireframe={!hovered}
        emissive={hovered ? color : "#000000"}
        emissiveIntensity={0.5}
      />

      <Html center position={[0, 0, 0]} className="pointer-events-none">
        <div
          className={`transition-all duration-300 ${hovered ? "scale-125 opacity-100" : "scale-100 opacity-60"}`}
        >
          <Icon
            size={40}
            style={{
              // Si un gradientId est fourni et survolé, on utilise l'URL du dégradé SVG
              fill:
                hovered && gradientId ? `url(#${gradientId})` : "currentColor",
              // On rend la couleur de base transparente pour laisser passer le fill SVG
              color:
                hovered && gradientId
                  ? "transparent"
                  : hovered
                    ? "#ffffff"
                    : color,
              filter: `drop-shadow(0px 0px 10px ${color})`,
            }}
          />
        </div>
      </Html>
    </mesh>
  );
};

const Footer3D = () => {
  return (
    <footer className="relative h-72 bg-black border-t border-lanAccent/30 overflow-hidden flex flex-col items-center justify-center">
      {/* Définitions SVG pour les dégradés (invisibles sur la page) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* Dégradé Instagram Sunrise */}
          <radialGradient id="insta-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>

          {/* Dégradé TikTok Glitch */}
          <linearGradient id="tiktok-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25F4EE" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#FE2C55" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 z-0 cursor-pointer">
        <Canvas camera={{ position: [0, 0, 7.5] }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#d4af37" />
          <pointLight
            position={[-10, -10, -10]}
            intensity={1}
            color="#c21f1f"
          />

          <SocialNode
            position={[-3.75, 0, 0]}
            color="#E1306C"
            gradientId="insta-grad"
            Icon={FaInstagram}
            url="#"
            label="Instagram"
          />

          <SocialNode
            position={[-1.25, 0, 0]}
            color="#9146FF"
            Icon={FaTwitch}
            url="#"
            label="Twitch"
          />

          <SocialNode
            position={[1.25, 0, 0]}
            color="#25F4EE"
            gradientId="tiktok-grad"
            Icon={FaTiktok}
            url="#"
            label="TikTok"
          />

          <SocialNode
            position={[3.75, 0, 0]}
            color="#1877F2"
            Icon={FaFacebook}
            url="#"
            label="Facebook"
          />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </div>

      <div className="absolute bottom-6 z-10 text-center pointer-events-none">
        <h3 className="text-xl font-gaming text-white tracking-widest drop-shadow-glow-red">
          LAN Gaming 2026
        </h3>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest">
          Cégep de Saint-Félicien
        </p>
      </div>
    </footer>
  );
};

export default Footer3D;
