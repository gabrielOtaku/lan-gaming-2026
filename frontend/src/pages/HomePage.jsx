import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "../utils/animations.js";
import HeroCanvas from "../components/home/HeroCanvas.jsx";
import BioConcept from "../components/home/BioConcept.jsx";
import LanGallery from "../components/home/LanGallery.jsx";
import PartnerBanner from "../components/home/Sponsor.jsx";
import FoundationBlock from "../components/home/FoundationBlock.jsx";

function SectionDivider({ label }) {
  return (
    <div className="relative flex items-center justify-center py-2 bg-obsidian-900">
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember-400/20 to-transparent" />
      {label && (
        <div className="relative z-10 px-4 py-1 bg-obsidian-900 border border-ember-400/10">
          <span className="font-mono text-ember-700 text-[9px] tracking-[0.5em] uppercase">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <HeroCanvas />

      <BioConcept />

      <SectionDivider label="Archives" />

      <LanGallery />

      <SectionDivider label="Partenaires" />

      <PartnerBanner />

      <SectionDivider label="Fondation" />

      <FoundationBlock />
    </motion.div>
  );
}
