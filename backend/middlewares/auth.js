import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lan2026-jwt-secret-change-in-production';

// Cookie takes priority (HttpOnly — XSS-safe). Bearer header is kept as fallback
// for API clients (Postman, curl) and during the transition window.
function extractToken(req) {
  if (req.cookies?.auth_token) return req.cookies.auth_token;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Non authentifié.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

export function requireAdmin(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Non authentifié.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Accès admin requis.' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}
