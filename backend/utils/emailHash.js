import { scryptSync, timingSafeEqual } from 'crypto';

// Hache les adresses admin (scrypt) pour qu'elles ne soient jamais stockées
// en clair dans .env / la config de l'hébergeur — seule leur empreinte y
// vit. Ce ne sont pas des mots de passe (pas besoin d'un coût élevé par
// utilisateur), mais scrypt reste résistant au brute-force par dictionnaire
// si le fichier de config venait à fuiter, contrairement à un simple SHA-256.
// Le pepper vient de l'environnement, jamais du code source.
const PEPPER = process.env.EMAIL_HASH_PEPPER || 'dev-only-email-pepper-do-not-use-in-prod';

export function hashEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return scryptSync(normalized, PEPPER, 32).toString('hex');
}

// Comparaison en temps constant — évite qu'un timing attack révèle
// progressivement le hash stocké octet par octet.
export function emailMatchesHash(email, hash) {
  if (!hash) return false;
  const candidate = Buffer.from(hashEmail(email), 'hex');
  const target = Buffer.from(hash, 'hex');
  if (candidate.length !== target.length) return false;
  return timingSafeEqual(candidate, target);
}
