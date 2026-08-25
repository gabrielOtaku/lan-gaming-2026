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
export const SESSION_SECRET = process.env.SESSION_SECRET || JWT_SECRET;
export const ADMIN_PASSWORD = requireSecret('ADMIN_PASSWORD', 'dev-only-admin-password');
