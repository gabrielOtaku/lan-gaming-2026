const isProd = process.env.NODE_ENV === 'production';

// Fails fast on boot in production instead of silently running with a
// secret that's sitting in plain text in this public repo's git history.
function requireSecret(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (isProd) {
    throw new Error(`[SECURITY] ${name} doit être défini (variable d'environnement) avant de démarrer en production.`);
  }
  console.warn(`[SECURITY] ${name} non défini — secret de développement temporaire utilisé (ne jamais utiliser en production).`);
  return devFallback;
}

export const JWT_SECRET = requireSecret('JWT_SECRET', 'dev-only-jwt-secret-do-not-use-in-prod');
// Distinct de JWT_SECRET en production (plan de mise en ligne V1 §5) — en dev
// seulement, retomber sur JWT_SECRET évite d'exiger une 2e variable pour rien.
export const SESSION_SECRET = isProd
  ? requireSecret('SESSION_SECRET', 'unreachable-prod-requires-explicit-value')
  : (process.env.SESSION_SECRET || JWT_SECRET);
export const ADMIN_PASSWORD = requireSecret('ADMIN_PASSWORD', 'dev-only-admin-password');

// Emails ne sont pas des secrets, mais leur exposer une VRAIE valeur de
// secours dans le code source public accorderait le rôle admin par défaut à
// une identité réelle si l'hébergeur oublie de définir la variable — le
// même principe fail-fast que requireSecret() s'applique ici (plan de mise
// en ligne V1 §5 : "le code ne doit pas accorder un rôle admin via une
// valeur de secours réelle").
export const ADMIN_LOGIN_EMAIL = requireSecret('ADMIN_EMAIL', 'dev-admin@localhost').toLowerCase();
export const ADMIN_OAUTH_EMAILS = requireSecret('ADMIN_EMAILS', 'dev-admin@localhost')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
