import { useEffect, useState } from 'react';
import { supabase, DONATION_CAMPAIGN_SLUG } from '../lib/supabase.js';

// Lecture + Realtime de donation_campaigns. Le total (raised_cents) n'avance
// jamais depuis ce hook — seul le webhook Stripe → Edge Function →
// record_paid_donation() peut l'incrémenter (règle non négociable du guide).
export function useDonationCampaign() {
  const [campaign, setCampaign] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let channel;
    let cancelled = false;

    async function init() {
      const { data, error: campaignError } = await supabase
        .from('donation_campaigns')
        .select('id,slug,title,goal_cents,raised_cents,donor_count,currency')
        .eq('slug', DONATION_CAMPAIGN_SLUG)
        .single();

      if (cancelled) return;
      if (campaignError) {
        setError(campaignError.message);
        return;
      }
      setCampaign(data);
      setError(null);

      const { data: milestoneRows } = await supabase
        .from('donation_milestones')
        .select('amount_cents,title,description,sort_order')
        .eq('campaign_id', data.id)
        .order('sort_order');
      if (!cancelled && milestoneRows) setMilestones(milestoneRows);

      channel = supabase
        .channel('donation-campaign-live')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'donation_campaigns',
          filter: `slug=eq.${DONATION_CAMPAIGN_SLUG}`,
        }, ({ new: next }) => setCampaign(next))
        .subscribe();
    }

    init();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const nextMilestone = campaign
    ? milestones.find((m) => m.amount_cents > campaign.raised_cents) || null
    : null;

  return { campaign, milestones, nextMilestone, error };
}
