import React from "react";
import { motion } from "framer-motion";

// Barre de progression de la cagnotte Supabase — utilisée sur /cagnotte et
// sur l'overlay /overlay/donation-goal. raised_cents/goal_cents viennent
// exclusivement de useDonationCampaign(), jamais recalculés localement.
export default function DonationGoal({ campaign, nextMilestone, compact = false }) {
  if (!campaign) return null;

  const raised = campaign.raised_cents / 100;
  const goal = campaign.goal_cents / 100;
  const pct = Math.min(100, (raised / goal) * 100);

  return (
    <div>
      <div className={`flex items-baseline justify-between ${compact ? "mb-2" : "mb-3"}`}>
        <span className={`font-display font-black text-amber-300 ${compact ? "text-2xl" : "text-3xl"}`}>
          {raised.toLocaleString("fr-CA")}$
        </span>
        <span className="font-mono text-zinc-500 text-xs">
          / {goal.toLocaleString("fr-CA")}$
        </span>
      </div>
      <div
        className="h-2.5 bg-obsidian-700 overflow-hidden"
        style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}
      >
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(90deg, #C89B3C, #FFD700)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="font-mono text-zinc-600 text-[10px] tracking-widest">
          {pct.toFixed(1)}% · {campaign.donor_count} don{campaign.donor_count !== 1 ? "s" : ""}
        </span>
        {nextMilestone && (
          <span className="font-mono text-zinc-600 text-[10px] tracking-widest uppercase">
            Prochain palier : {(nextMilestone.amount_cents / 100).toLocaleString("fr-CA")}$
          </span>
        )}
      </div>
    </div>
  );
}
