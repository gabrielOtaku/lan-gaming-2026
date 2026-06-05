import express from "express";
import { validateAndSanitize } from "../middleware/validate.js";

const router = express.Router();

// Route de test pour vérifier que l'API répond
router.get("/status", (req, res) => {
  res.json({ status: "En ligne", message: "Serveur LAN 2026 opérationnel." });
});

// Route sécurisée pour la billetterie ou le contact
router.post("/ticket", validateAndSanitize, (req, res) => {
  const safeData = req.cleanData;

  // Ici viendrait la logique d'insertion en base de données (ex: MongoDB ou PostgreSQL)
  // et potentiellement la connexion à l'API de paiement ou d'envoi de courriel.

  console.log("Nouvelle inscription sécurisée reçue :", safeData);

  res.status(200).json({
    success: true,
    message: "Réservation confirmée. Bienvenue dans le Grind.",
  });
});

// Dans backend/routes/api.js
router.post("/contact", validateAndSanitize, (req, res) => {
  const { name, email, subject, message } = req.cleanData;

  // Ici, tu pourrais ajouter `nodemailer` pour envoyer un vrai mail à comiteetuinfo@cegepstfe.ca
  console.log(`[SAV] Message de ${name} (${email}) : ${subject} - ${message}`);

  res.status(200).json({
    success: true,
    message:
      "Votre demande a bien été transmise à notre équipe. Nous vous répondrons sous peu.",
  });
});
export { router as apiRoutes };
