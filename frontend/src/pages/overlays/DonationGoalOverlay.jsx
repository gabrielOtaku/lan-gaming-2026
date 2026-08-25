import React, { useEffect } from "react";
import { Heart } from "lucide-react";
import { useDonationCampaign } from "../../hooks/useDonationCampaign.js";
import DonationGoal from "../../components/donations/DonationGoal.jsx";

// Browser Source OBS/Streamlabs — barre d'objectif permanente (guide §10).
// Fond transparent, aucun habillage du site (voir App.jsx: isOverlayPath()).
export default function DonationGoalOverlay() {
  const { campaign, nextMilestone } = useDonationCampaign();

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  return (
    <div style={{ background: "transparent", minHeight: "100vh", padding: 32 }}>
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: 32,
          width: 380,
          background: "rgba(7,9,15,0.88)",
          border: "1px solid rgba(255,215,0,0.35)",
          padding: "18px 22px",
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          boxShadow: "0 0 40px rgba(255,215,0,0.12)",
          opacity: campaign ? 1 : 0,
          transition: "opacity 0.4s",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} color="#FFD700" fill="#FFD700" />
          <span
            className="font-mono uppercase"
            style={{ fontSize: 11, letterSpacing: "0.3em", color: "#FFD700" }}
          >
            Fondation du Cégep CSF
          </span>
        </div>
        <DonationGoal campaign={campaign} nextMilestone={nextMilestone} compact />
      </div>
    </div>
  );
}
