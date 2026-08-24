// Must run before any local import — those read process.env at module load
// time (config/secrets.js, routes/auth.js), and static ESM imports are all
// evaluated in source order before this file's own body runs. Importing
// dotenv/config here (instead of `import dotenv from "dotenv"` + a later
// `dotenv.config()` call) guarantees .env is populated first.
import "dotenv/config";

import { createServer } from 'http';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import session from "express-session";
import passport from "passport";
import { Server as SocketIO } from "socket.io";
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";
import { donationsRouter, stripeWebhookRouter } from "./routes/donations.js";
import { SESSION_SECRET } from "./config/secrets.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// ── Configuration Proxy ────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173"
).split(",");

// ── Sécurité HTTP Headers ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "http://localhost:4000",
          "http://localhost:5173",
          "ws://localhost:4000",
          "wss://localhost:4000",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// ── CORS ────────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── Session ──────────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// ── Cookie Parser ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Webhook Stripe ─────────────────────────────────────────────────────────────
// Doit être monté AVANT express.json() : Stripe signe le corps brut de la
// requête, et un body déjà parsé/re-sérialisé ne correspond plus à cette
// signature. Le reste des routes /api continue de recevoir du JSON normalement.
app.use("/api", stripeWebhookRouter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite API atteinte. Veuillez réessayer dans quelques minutes." },
});
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de messages. Patientez une minute, Joueur." },
});
app.use("/api", apiLimiter);
app.use("/api/chat", chatLimiter);

// ── Socket.io — init avant les routes pour pouvoir injecter via app.set ───────
const io = new SocketIO(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
});
app.set('io', io);

const ADJ  = ['Shadow', 'Neon', 'Cyber', 'Ghost', 'Void', 'Glitch', 'Storm', 'Rogue', 'Dark', 'Hyper'];
const NOUN = ['Hawk', 'Wolf', 'Fox', 'Knight', 'Reaper', 'Viper', 'Wraith', 'Phantom', 'Blade', 'Hunter'];
const COLORS = ['#FF4655', '#4FC3F7', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#84CC16'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const connected = new Map(); // socketId → { name, color, x, y }

io.on('connection', (socket) => {
  const name  = `${pick(ADJ)}_${pick(NOUN)}`;
  const color = pick(COLORS);
  connected.set(socket.id, { name, color, x: -500, y: -500 });

  socket.emit('identity', { name, color });

  const others = {};
  connected.forEach((u, id) => { if (id !== socket.id) others[id] = u; });
  socket.emit('users', others);

  socket.broadcast.emit('user-join', { id: socket.id, name, color });

  socket.on('cursor', ({ x, y }) => {
    const user = connected.get(socket.id);
    if (!user) return;
    user.x = x;
    user.y = y;
    socket.broadcast.emit('cursor', { id: socket.id, x, y });
  });

  socket.on('disconnect', () => {
    connected.delete(socket.id);
    io.emit('user-leave', socket.id);
    console.log(`[Socket] -1 cursor (${connected.size} actifs)`);
  });

  console.log(`[Socket] +1 cursor "${name}" (${connected.size} actifs)`);
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api", donationsRouter);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ── 404 / Error handlers ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route non trouvée." }));
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? "Erreur interne du serveur." : err.message });
});

// ── Start ──────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🎮 LAN Gaming 2026 Backend → http://localhost:${PORT}`);
});

export default app;
