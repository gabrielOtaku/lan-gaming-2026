import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, ADMIN_PASSWORD, ADMIN_EMAIL_HASH, ADMIN_EMAIL_HASHES } from '../config/secrets.js';
import { emailMatchesHash } from '../utils/emailHash.js';

const router = Router();

// Rate limit dédié, plus strict que le limiteur /api général — cible le
// brute-force sur le seul point d'entrée protégé par mot de passe (plan de
// mise en ligne V1 §5). Ne compte que les tentatives échouées pour ne pas
// bloquer un admin qui recharge la page après une connexion réussie.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.' },
});

const FRONTEND_URL = process.env.FRONTEND_URL  || 'http://localhost:5173';

// Cookie options — HttpOnly blocks JS access (XSS-safe). SameSite=Lax in both
// dev and prod: l'architecture recommandée sert le frontend et /api depuis le
// même domaine via reverse proxy (plan de mise en ligne V1 §4/§5), donc
// SameSite=None (cross-site) n'est pas nécessaire et n'augmenterait que le
// risque CSRF sans bénéfice.
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,
  path:     '/',
};

function createToken(email, name, picture) {
  const role = ADMIN_EMAIL_HASHES.some((h) => emailMatchesHash(email, h)) ? 'admin' : 'user';
  return jwt.sign({ email, name, picture, role }, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('auth_token', token, COOKIE_OPTS);
}

// ── Passport — Google OAuth ───────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    },
    (_at, _rt, profile, done) => {
      const email   = profile.emails?.[0]?.value || '';
      const name    = profile.displayName || 'Utilisateur';
      const picture = profile.photos?.[0]?.value || null;
      done(null, { email, name, picture });
    },
  ));
}

// ── Passport — Microsoft OAuth ────────────────────────────────────────────────
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use('microsoft', new OAuth2Strategy(
    {
      authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL:         'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      clientID:         process.env.MICROSOFT_CLIENT_ID,
      clientSecret:     process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL:      process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:4000/api/auth/microsoft/callback',
      scope:            ['openid', 'email', 'profile'],
    },
    async (accessToken, _rt, _params, _profile, done) => {
      try {
        const r    = await fetch('https://graph.microsoft.com/v1.0/me', { headers: { Authorization: `Bearer ${accessToken}` } });
        const data = await r.json();
        done(null, { email: data.mail || data.userPrincipalName || '', name: data.displayName || 'Utilisateur', picture: null });
      } catch (err) { done(err); }
    },
  ));
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

  if (!emailMatchesHash(email, ADMIN_EMAIL_HASH) || password !== ADMIN_PASSWORD) {
    return setTimeout(() => res.status(401).json({ error: 'Identifiants incorrects.' }), 400);
  }

  const token = createToken(email, 'Administrateur', null);
  setAuthCookie(res, token);
  res.json({ success: true, user: { email, name: 'Administrateur', role: 'admin' } });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: 'Non authentifié.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: { email: decoded.email, name: decoded.name, role: decoded.role, picture: decoded.picture } });
  } catch {
    res.clearCookie('auth_token', { path: '/' });
    res.status(401).json({ error: 'Session expirée.' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.json({ success: true });
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.redirect(`${FRONTEND_URL}?auth_error=google_not_configured`);
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) return res.redirect(`${FRONTEND_URL}?auth_error=google_not_configured`);
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}?auth_error=google_failed` })(req, res, next);
  },
  (req, res) => {
    const token = createToken(req.user.email, req.user.name, req.user.picture);
    setAuthCookie(res, token);
    res.redirect(FRONTEND_URL); // no token in URL
  },
);

// ── Microsoft OAuth ───────────────────────────────────────────────────────────
router.get('/microsoft', (req, res, next) => {
  if (!process.env.MICROSOFT_CLIENT_ID) return res.redirect(`${FRONTEND_URL}?auth_error=microsoft_not_configured`);
  passport.authenticate('microsoft')(req, res, next);
});

router.get('/microsoft/callback',
  (req, res, next) => {
    if (!process.env.MICROSOFT_CLIENT_ID) return res.redirect(`${FRONTEND_URL}?auth_error=microsoft_not_configured`);
    passport.authenticate('microsoft', { session: false, failureRedirect: `${FRONTEND_URL}?auth_error=microsoft_failed` })(req, res, next);
  },
  (req, res) => {
    const token = createToken(req.user.email, req.user.name, req.user.picture);
    setAuthCookie(res, token);
    res.redirect(FRONTEND_URL); // no token in URL
  },
);

export default router;
