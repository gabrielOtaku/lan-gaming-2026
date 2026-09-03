// Utilitaire local pour générer le hash d'une adresse admin, à coller dans
// ADMIN_EMAIL_HASH / ADMIN_EMAILS_HASH sur l'hébergeur (cPanel > Setup
// Node.js App > variables d'environnement) — l'adresse en clair ne doit
// jamais être commitée ni collée ailleurs que dans cette variable.
//
// Usage :
//   EMAIL_HASH_PEPPER=<le_meme_pepper_qu_en_prod> node scripts/hash-email.js adresse@exemple.ca
//
// Si EMAIL_HASH_PEPPER n'est pas fourni, le hash utilise le pepper de dev —
// il ne correspondra pas à ce que le serveur de production calcule tant que
// le vrai EMAIL_HASH_PEPPER n'est pas défini de façon identique des deux côtés.
import { hashEmail } from '../utils/emailHash.js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/hash-email.js <email>');
  process.exit(1);
}
console.log(hashEmail(email));
