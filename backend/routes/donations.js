import express, { Router } from 'express';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../config/secrets.js';
import { loadJSON, saveJSON } from '../utils/persist.js';
import { sanitizeString } from '../utils/sanitize.js';
import { recordStripeDonation } from '../utils/cagnotteStore.js';

// Optionnelle comme mailer/genAI ailleurs dans ce projet : tant que les clés
// Stripe ne sont pas configurées, le reste du site continue de fonctionner —
// seul le don en ligne répond 503.
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
if (!STRIPE_SECRET_KEY) {
  console.warn('[STRIPE] STRIPE_SECRET_KEY non défini — dons en ligne désactivés.');
}

const MIN_AMOUNT_CENTS = 500;     // 5$ — plancher du cahier (§8.3)
const MAX_AMOUNT_CENTS = 500_000; // 5000$ — garde-fou anti fat-finger, pas une vraie limite métier
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Idempotence webhook (équivalent de la table stripe_events du cahier §8.6) ─
const processedEvents = loadJSON('stripe_events.json', {});

function alreadyProcessed(eventId) {
  return Boolean(processedEvents[eventId]);
}
function markProcessed(eventId) {
  processedEvents[eventId] = new Date().toISOString();
  saveJSON('stripe_events.json', processedEvents);
}

// ── POST /api/donations/checkout ──────────────────────────────────────────────
// Le navigateur envoie une intention de montant ; le serveur seul décide du
// prix réellement transmis à Stripe (§8.4 — ne jamais faire confiance au client).
export const donationsRouter = Router();

donationsRouter.post('/donations/checkout', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Les dons en ligne sont temporairement indisponibles.' });
  }

  const { amount, displayName, isAnonymous, message } = req.body || {};
  const cents = Math.round(Number(amount));
  if (!Number.isFinite(cents) || cents < MIN_AMOUNT_CENTS || cents > MAX_AMOUNT_CENTS) {
    return res.status(400).json({
      error: `Montant invalide (entre ${MIN_AMOUNT_CENTS / 100}$ et ${MAX_AMOUNT_CENTS / 100}$).`,
    });
  }

  const anonymous = isAnonymous !== false; // anonyme par défaut (§9.4)
  const cleanName = anonymous ? '' : sanitizeString(String(displayName || '').slice(0, 60));
  const cleanMessage = sanitizeString(String(message || '').slice(0, 200));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: 'Don — Fondation du Cégep de Saint-Félicien (LAN Gaming 2026)' },
          unit_amount: cents,
        },
        quantity: 1,
      }],
      metadata: {
        campaign: 'lan-gaming-2026-fondation',
        is_anonymous: String(anonymous),
        display_name: cleanName,
        message: cleanMessage,
      },
      success_url: `${FRONTEND_URL}/cagnotte?don=succes`,
      cancel_url: `${FRONTEND_URL}/cagnotte?don=annule`,
    });
    res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    console.error('[STRIPE_CHECKOUT_ERROR]', err.message);
    res.status(500).json({ error: 'Impossible de créer la session de paiement.' });
  }
});

// ── POST /api/donations/webhook ───────────────────────────────────────────────
// Doit recevoir le corps BRUT (pas encore parsé en JSON) pour que la
// vérification de signature Stripe soit valide — voir server.js, monté avant
// express.json(). Seul cet événement, signé et vérifié côté serveur, peut
// faire avancer la cagnotte (§8.5 — jamais /success, jamais une valeur client).
export const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  '/donations/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(503).end();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error('[STRIPE_WEBHOOK_SIGNATURE_ERROR]', err.message);
      return res.status(400).send('Signature webhook invalide.');
    }

    if (alreadyProcessed(event.id)) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        recordStripeDonation({
          amountCents: session.amount_total,
          displayName: session.metadata?.is_anonymous === 'false' ? session.metadata?.display_name : null,
          message: session.metadata?.message || null,
        });
        console.log('[DONATION]', session.amount_total / 100, 'CAD —', session.id);
      }
    }

    markProcessed(event.id);
    res.status(200).json({ received: true });
  },
);
