# ⚔️ LAN Gaming 2026 — Cégep de Saint-Félicien

> Site événementiel full-stack gaming. DA "Clair-Obscur" / God of War. React · Three.js · Framer Motion · Node.js · Zod.

---

## 🗂️ Architecture complète

```
lan-gaming-2026/
├── package.json                    # Orchestrateur root (concurrently)
│
├── backend/
│   ├── package.json
│   ├── server.js                   # Express + Helmet + CORS + Rate Limiting
│   ├── .env.example
│   ├── routes/
│   │   └── api.js                  # GET /events, GET /partners, POST /contact, POST /ticket-redirect
│   ├── middlewares/
│   │   └── validate.js             # Schémas Zod + middleware factory
│   └── utils/
│       └── sanitize.js             # XSS sanitization (xss lib)
│
└── frontend/
    ├── package.json
    ├── vite.config.js              # Proxy /api → backend:4000, code splitting
    ├── tailwind.config.js          # DA Clair-Obscur: obsidian, ember, rune colors
    ├── postcss.config.js
    ├── index.html                  # Google Fonts: Cinzel, Rajdhani, Share Tech Mono
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── main.jsx
        ├── App.jsx                 # BrowserRouter + AnimatePresence + Loader
        ├── styles/
        │   └── globals.css         # Custom scrollbar, noise overlay, scan lines, utilities
        ├── utils/
        │   ├── animations.js       # 20+ variants Framer Motion (fadeIn, scroll, modal, page...)
        │   └── api.js              # Axios client + interceptors
        ├── pages/
        │   ├── HomePage.jsx        # Hero 3D + BioConcept + PartnerBanner + FoundationBlock
        │   ├── CalendarPage.jsx    # Hero + Countdown + Timeline + MapOverlay
        │   └── TicketsPage.jsx     # Hero 3D + EventInfoBar + TicketModal + FAQ
        └── components/
            ├── layout/
            │   ├── Navbar.jsx      # Sticky glassmorphism + mobile menu animé
            │   ├── Loader.jsx      # Écran de chargement gaming (barre, particules, emblème)
            │   ├── Footer3D.jsx    # Canvas React Three Fiber — orbes 3D réseaux sociaux
            │   └── CustomCursor.jsx# Curseur crosshair animé (Framer Motion springs)
            ├── home/
            │   ├── HeroCanvas.jsx  # Full-screen Three.js (grid, shards, ember core, stars)
            │   ├── BioConcept.jsx  # Timeline histoire avec parallaxe + scroll reveal
            │   ├── PartnerBanner.jsx # Ticker infini + badges par tier
            │   └── FoundationBlock.jsx # Section caritative avec donut animé
            ├── calendar/
            │   ├── Timeline.jsx    # 3 colonnes par jour, expandable cards, filtres
            │   └── MapOverlay.jsx  # Plans SVG interactifs (Place centrale, Azimut, Gymnase)
            └── tickets/
                └── TicketModal.jsx # 3 types de billets + quantité + modal de confirmation
```

---

## 🚀 Installation & Démarrage

### Prérequis
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### 1. Clone & Install

```bash
# Cloner le repo
git clone <votre-repo>
cd lan-gaming-2026

# Installer toutes les dépendances (backend + frontend)
npm install
npm run install:all
```

### 2. Configuration Backend

```bash
cd backend
cp .env.example .env
# Éditer .env selon votre environnement
```

Variables d'environnement (.env) :
```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
TICKET_URL=https://billetterie.cstfelicien.qc.ca/lan2026
NODE_ENV=development
```

### 3. Lancer en développement

```bash
# Depuis la racine — lance backend + frontend simultanément
npm run dev
```

Ou séparément :
```bash
npm run dev:backend   # → http://localhost:4000
npm run dev:frontend  # → http://localhost:5173
```

### 4. Build production

```bash
npm run build         # Build le frontend dans frontend/dist/
npm run start:backend # Démarre le backend
```

---

## 🔒 Sécurité

| Mesure | Détail |
|--------|--------|
| **Helmet.js** | Headers HTTP sécurisés (CSP, HSTS, X-Frame-Options...) |
| **CORS strict** | Origines autorisées via variable d'environnement |
| **Rate Limiting** | 100 req/15min global · 20 req/5min API |
| **Zod** | Validation et parsing des entrées avant tout traitement |
| **XSS (xss lib)** | Sanitization de tous les strings entrants |
| **Body limit** | Requêtes limitées à 10kb |
| **Vite proxy** | Le frontend ne connaît pas l'URL du backend en prod |

---

## 🎨 Design System

### Palette
- **Obsidian** : `#030508` → `#1A2332` (fonds)
- **Ember/Gold** : `#C89B3C` → `#FFD700` (accents principaux)
- **Blood** : `#2D0A0A` → `#CC2222` (accents caritatifs)
- **Rune Blue** : `#4FC3F7` | **Rune Red** : `#FF4655` | **Rune Teal** : `#00D4AA`

### Typographie
- **Cinzel** (display) — titres épiques
- **Rajdhani** (body) — lisibilité gaming
- **Share Tech Mono** (mono) — codes, labels
- **Uncial Antiqua** (rune) — citations

### Effets visuels
- Noise overlay + scan lines (CSS)
- Curseur custom crosshair (Framer Motion springs)
- Particules ember 3D (React Three Fiber)
- Glow pulsant, clip-path diagonal, glassmorphism

---

## 📦 Stack technique

### Frontend
| Lib | Usage |
|-----|-------|
| React 18 | UI components |
| React Router 6 | Routing SPA |
| Framer Motion 11 | Animations, page transitions, scroll reveal |
| React Three Fiber | Canvas 3D (hero, footer) |
| Three.js | Scènes 3D (shards, orbs, particles, stars) |
| @react-three/drei | Stars, Float, MeshDistortMaterial, Text |
| Tailwind CSS 3 | Utility-first styling + custom tokens |
| Lenis | Smooth scrolling |
| Axios | Client HTTP |
| Vite 5 | Bundler avec code splitting |

### Backend
| Lib | Usage |
|-----|-------|
| Express 4 | Serveur HTTP |
| Helmet 7 | Sécurité headers |
| cors | Configuration CORS |
| express-rate-limit | Protection DDoS |
| Zod 3 | Validation schémas |
| xss | Sanitisation XSS |
| dotenv | Variables d'environnement |

---

## 🗺️ Routes API

```
GET  /health                    → Status du serveur
GET  /api/events                → Liste des événements du calendrier
GET  /api/partners              → Liste des partenaires
POST /api/contact               → Formulaire de contact (validé + sanitisé)
POST /api/ticket-redirect       → Redirection billetterie (validé + sanitisé)
```

---

## 📄 Pages

| Route | Page | Composants clés |
|-------|------|-----------------|
| `/` | Accueil | HeroCanvas, BioConcept, PartnerBanner, FoundationBlock |
| `/calendrier` | Calendrier | Timeline (3 jours, filtres), MapOverlay (3 arènes SVG) |
| `/billetterie` | Billetterie | TicketModal (3 types), FAQ, Trust section |

---

## 🔧 Personnalisation

### Ajouter un partenaire
→ `backend/routes/api.js` → tableau `partners`

### Modifier les événements
→ `backend/routes/api.js` → tableau `events`
→ `frontend/src/components/calendar/Timeline.jsx` → tableau `EVENTS` (local fallback)

### Changer l'URL de billetterie
→ `backend/.env` → variable `TICKET_URL`

### Ajouter un logo partenaire réel
→ Remplacer les initiales dans `PartnerBanner.jsx` par `<img src="/logos/nom.svg" alt="..." />`
→ Déposer les logos dans `frontend/public/logos/`

---

## 📞 Contact & Déploiement

Pour la mise en production, configurer :
1. Un serveur Node.js (Railway, Render, VPS)
2. Un CDN pour le frontend buildé (`frontend/dist/`)
3. Les variables d'environnement de production
4. Un reverse proxy (Nginx) pour server les deux sur le même domaine

---

*LAN Gaming 2026 · Cégep de Saint-Félicien · Développé avec ⚔️ et 🔥*
