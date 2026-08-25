import { createClient } from '@supabase/supabase-js';

// Publishable key only — RLS on the Supabase side is what actually protects
// the data (donation_campaigns/milestones/public_feed readable, donations/
// stripe_events never readable by this client). See backend/.claude/skills
// and the "Cégep en LAN 2026 - Guide Supabase/Stripe/Twitch" for the schema.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

export const DONATION_CAMPAIGN_SLUG = 'cegep-en-lan-2026';
