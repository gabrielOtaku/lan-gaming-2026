import express from "express";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "lan_gaming_secret_2026",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "TA_CLE_API_ICI",
);

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Tu es le chatbot officiel de la LAN Gaming 2026 du Cégep de Saint-Félicien. Réponds de manière concise, gaming et polie à cette question : ${message}`;
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res
      .status(500)
      .json({
        reply: "Erreur système. Le nexus de communication est hors ligne.",
      });
  }
});

app.get("/api/auth/me", (req, res) => {
  if (req.isAuthenticated()) return res.json({ user: req.user });
  res.json({ user: null });
});

app.listen(PORT, () =>
  console.log(`Serveur LAN 2026 opérationnel sur le port ${PORT}`),
);
