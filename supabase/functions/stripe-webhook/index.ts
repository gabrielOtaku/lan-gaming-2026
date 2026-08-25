// Edge Function : reçoit les webhooks Stripe (checkout.session.completed) et
// appelle record_paid_donation(), la seule fonction autorisée à faire avancer
// donation_campaigns.raised_cents (revoked de public/anon/authenticated — voir
// la migration SQL du guide "Cégep en LAN 2026 - Guide Supabase/Stripe/Twitch").
//
// DÉPLOIEMENT (pas de CLI/token disponible pour le faire depuis cette session) :
//   Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//   Nom: stripe-webhook · verify_jwt = false (Stripe n'envoie pas de JWT Supabase,
//   la sécurité vient de la vérification de signature ci-dessous).
//
// SECRETS À AJOUTER (Dashboard → Edge Functions → stripe-webhook → Secrets) :
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SIGNING_SECRET, SUPABASE_URL,
//   SUPABASE_SERVICE_ROLE_KEY
//
// CHAMPS PERSONNALISÉS DU PAYMENT LINK — à créer dans Stripe Dashboard sur
// buy.stripe.com/test_8x2fZheWq7kg3RfdNV7Zu00 avec CES clés exactes (ou
// ajuster FIELD_DISPLAY_NAME / FIELD_PRIVACY_CHOICE ci-dessous pour matcher
// ce qui existe déjà) :
//   - "nom_ou_pseudo" (texte, facultatif)
//   - "affichage_du_don" (menu déroulant : "public" / "anonyme")
// Si ces champs n'existent pas sur le Payment Link, le don est simplement
// traité comme anonyme — rien ne casse.

import Stripe from 'npm:stripe@^22';
import { createClient } from 'npm:@supabase/supabase-js@2';

const FIELD_DISPLAY_NAME = 'nom_ou_pseudo';
const FIELD_PRIVACY_CHOICE = 'affichage_du_don';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error('Stripe signature error', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      return Response.json({ ok: true, ignored: 'not_paid' });
    }

    const fields = Object.fromEntries(
      (session.custom_fields ?? []).map((f) => [
        f.key,
        f.text?.value ?? f.dropdown?.value ?? f.numeric?.value ?? null,
      ]),
    );

    const displayName = String(fields[FIELD_DISPLAY_NAME] ?? '');
    const privacyChoice = String(fields[FIELD_PRIVACY_CHOICE] ?? 'anonyme');
    const isAnonymous = privacyChoice !== 'public';

    const { data, error } = await supabaseAdmin.rpc('record_paid_donation', {
      p_stripe_event_id: event.id,
      p_event_type: event.type,
      p_session_id: session.id,
      p_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : '',
      p_amount_cents: session.amount_total ?? 0,
      p_currency: session.currency ?? 'cad',
      p_display_name: displayName,
      p_is_anonymous: isAnonymous,
    });

    if (error) {
      console.error('Database error', error);
      return new Response('Database error', { status: 500 });
    }

    console.log('Donation processed', data);
  }

  return Response.json({ received: true });
});
