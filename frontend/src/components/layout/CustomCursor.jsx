import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const trailX = useMotionValue(-100);
  const trailY = useMotionValue(-100);

  // Configuration de la physique du ressort (Spring) pour le point et l'anneau
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  const trailConfig = { damping: 35, stiffness: 150, mass: 1 };
  const trailSpringX = useSpring(trailX, trailConfig);
  const trailSpringY = useSpring(trailY, trailConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      // Détecte si l'élément survolé est cliquable (lien, bouton, ou a une propriété hover)
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.dataset.hover
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cursorX, cursorY, trailX, trailY]);

  return (
    <>
      {/* Anneau de traînée (Trail ring) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: trailSpringX,
          y: trailSpringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full border-2"
          animate={{
            width: isHovering ? 45 : isClicking ? 20 : 32,
            height: isHovering ? 45 : isClicking ? 20 : 32,
            opacity: isHovering ? 0.9 : 0.5,
            borderColor: isHovering ? "#FFD700" : "#C89B3C",
            boxShadow: isHovering
              ? "0 0 20px rgba(255,215,0,0.5)"
              : "0 0 10px rgba(200,155,60,0.2)",
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>

      {/* Point central (Core dot) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10001]"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full bg-[#FFD700]"
          animate={{
            width: isClicking ? 8 : 5,
            height: isClicking ? 8 : 5,
            opacity: isHovering ? 1 : 0.9,
            boxShadow: isHovering
              ? "0 0 12px rgba(255,215,0,1)"
              : "0 0 6px rgba(255,215,0,0.8)",
          }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>
    </>
  );
}
