# Déploiement sur cPanel (hébergement du Cégep)

Ce guide remplace la recommandation générique « frontend + /api derrière un
reverse proxy » du plan de mise en ligne V1 par les étapes concrètes pour
l'hébergement réel : **cPanel avec licence WordPress déjà active** sur le
compte du Cégep. Deux parties distinctes à déployer :

- **Frontend** (React/Vite) → fichiers statiques servis directement par
  Apache/LiteSpeed.
- **Backend** (Express) → application Node via **"Setup Node.js App"**
  (Phusion Passenger / CloudLinux Node.js Selector), la fonctionnalité cPanel
  standard pour faire tourner un process Node persistant.

Aucune configuration nginx/reverse proxy manuelle n'est nécessaire : cPanel
génère lui-même le `.htaccess` de passthrough Passenger à partir du champ
*Application URL* — voir étape 3.

## 0. Où ça vit dans cPanel

WordPress reste sur le domaine principal du Cégep, intact. LAN Gaming 2026
vit sur son propre **sous-domaine** (`lan2026.cegepstfe.ca`, déjà la valeur
utilisée partout dans le code — `index.html`, `sitemap.xml`, `robots.txt`,
`.env.example`). Créer ce sous-domaine dans cPanel (*Domains* ou
*Sous-domaines*) avec son propre document root (ex. `lan2026`), séparé de
`public_html` de WordPress.

## 1. Build du frontend (en local, avant upload)

```bash
cd frontend
npm ci
npm run build
```

Ça produit `frontend/dist/`. Le fichier `frontend/public/.htaccess` (ajouté
à ce dépôt) est copié tel quel dans `dist/` — il gère le fallback React
Router (SPA) et quelques en-têtes de sécurité pour les fichiers statiques.

## 2. Upload du frontend

Uploader **le contenu** de `frontend/dist/` (pas le dossier lui-même) dans
le document root du sous-domaine créé à l'étape 0, via le Gestionnaire de
fichiers cPanel ou FTP/SFTP.

## 3. Backend — Setup Node.js App

Dans cPanel → **Setup Node.js App** → *Create Application* :

| Champ | Valeur |
|---|---|
| Node.js version | La plus proche de **22.x LTS** disponible dans la liste. Si 22 n'y est pas, voir « Risque » ci-dessous. |
| Application mode | Production |
| Application root | ex. `lan2026-backend` (en dehors du document root public — le code Node ne doit pas être servable directement par Apache) |
| Application URL | `lan2026.cegepstfe.ca/api` — **c'est ce champ qui donne l'architecture même-domaine** requise par le plan V1 (cookies `SameSite=Lax`, pas de CORS cross-site) : cPanel route automatiquement `/api/*` vers le process Node, tout le reste continue vers les fichiers statiques de l'étape 2. |
| Application startup file | `server.js` |

Uploader le contenu de `backend/` (sauf `node_modules/`, `.env`) dans
l'*Application root* choisi, puis dans l'interface Setup Node.js App :

1. **Run NPM Install** (bouton dans l'UI, équivalent de `npm ci`).
2. **Environment variables** — ajouter ici, un par un, exactement les
   variables listées dans `backend/.env.example` avec leurs vraies valeurs
   de production (voir §4). C'est le remplaçant du fichier `.env` — plus
   fiable que d'uploader un `.env` dont les permissions pourraient être mal
   réglées sur du mutualisé.
3. **Restart** l'application après tout changement de variable ou de code.

## 4. Variables d'environnement à définir (production)

Reprendre `backend/.env.example` intégralement, en particulier :

- `NODE_ENV=production`
- `PORT` — **ne pas définir** : Passenger l'injecte lui-même, le code lit déjà `process.env.PORT`.
- `ALLOWED_ORIGINS=https://lan2026.cegepstfe.ca`
- `FRONTEND_URL=https://lan2026.cegepstfe.ca`
- `TICKET_URL=https://lan2026.cegepstfe.ca/billetterie`
- `JWT_SECRET`, `SESSION_SECRET`, `ADMIN_PASSWORD` — chaînes aléatoires longues et **distinctes**.
- `EMAIL_HASH_PEPPER` — chaîne aléatoire longue, à ne changer qu'en régénérant aussi les hashes ci-dessous.
- `ADMIN_EMAIL_HASH` / `ADMIN_EMAILS_HASH` — générés **en local**, jamais en clair ici :
  ```bash
  cd backend
  EMAIL_HASH_PEPPER=<même valeur que la variable ci-dessus> node scripts/hash-email.js adresse-officielle@cegepstfe.ca
  ```
  Coller le résultat (une empreinte hexadécimale) dans la variable cPanel — jamais l'adresse elle-même.
- `SMTP_USER` / `SMTP_PASS` / `SMTP_TO` — la vraie adresse Gmail (et son mot de passe d'application) qui doit recevoir les courriels du site.
- `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`/`SECRET`, `MICROSOFT_CLIENT_ID`/`SECRET` selon ce qui est activé.
- `GOOGLE_CALLBACK_URL=https://lan2026.cegepstfe.ca/api/auth/google/callback` (idem Microsoft) — à enregistrer aussi côté Google Cloud Console / Azure comme URI de redirection autorisée.

## 5. Persistance des données (JSON locaux)

`siteSettingsStore.js` et `cagnotteStore.js` écrivent sur disque (fichiers
JSON) — ça persiste normalement entre redémarrages Passenger, tant que le
dossier de données n'est pas effacé lors d'un futur ré-upload du code.
Recommandation : garder ce dossier de données **hors** de l'arborescence
qu'on remplace à chaque déploiement, ou faire une sauvegarde avant tout
ré-upload. À terme (plan V1 « reste ouvert ») : migrer vers Supabase pour ne
plus dépendre du disque d'un hébergement mutualisé.

## 6. À tester juste après le premier déploiement

- Toutes les routes React (`/billetterie`, `/competitions`, etc.) rechargées
  directement (F5) — vérifie que le `.htaccess` fait bien le fallback SPA.
- `/api/*` répond bien depuis le même domaine (pas d'erreur CORS dans la console).
- Connexion admin (`/api/auth/login`) et OAuth Google/Microsoft.
- Formulaire de contact / commande boutique → réception réelle du courriel sur `SMTP_TO`.
- Si des fonctionnalités temps réel (Socket.io) sont actives sur la page Live : confirmer que le WebSocket s'établit bien à travers Apache/LiteSpeed — certains hébergements mutualisés bloquent ou dégradent les upgrades WebSocket, auquel cas Socket.io retombe en polling HTTP (plus lent mais fonctionnel).
- Certificat SSL (AutoSSL) actif sur le sous-domaine.

## Risque connu : version de Node disponible

`backend/package.json` fixe `"engines": { "node": ">=22 <23" }`. Si le
sélecteur Node.js de ce compte cPanel ne propose pas encore la 22.x
(certains hébergeurs mettent du temps à l'ajouter), deux options :
1. Demander l'ajout de Node 22 au support d'hébergement (souvent une simple
   activation WHM côté hébergeur).
2. À défaut, redescendre temporairement la contrainte `engines` à la version
   LTS réellement disponible (ex. 20.x) — le code n'utilise aucune API
   spécifique à Node 22, donc ça fonctionnera, seule la fraîcheur de version
   en pâtit.
