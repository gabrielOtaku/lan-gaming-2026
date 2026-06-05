import express from "express";
import helmet from "helmet";
import cors from "cors";
import { apiRoutes } from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité maximale des headers
app.use(helmet());

// CORS restrictif (à adapter avec l'URL de ton frontend en prod)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  }),
);

app.use(express.json({ limit: "10kb" })); // Prévention des attaques DOS par payload

// Routes API
app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Une erreur critique est survenue." });
});

app.listen(PORT, () => {
  console.log(`Serveur LAN 2026 sécurisé lancé sur le port ${PORT}`);
});
