import { z } from "zod";
import { sanitizeObject } from "../utils/sanitize.js";

// Schéma Zod (Exemple pour la billetterie)
const ticketSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().optional(),
});

export const validateAndSanitize = (req, res, next) => {
  try {
    // 1. Validation de la forme des données avec Zod
    const validatedData = ticketSchema.parse(req.body);

    // 2. Nettoyage Anti-XSS profond via notre nouvel utilitaire
    const safeData = sanitizeObject(validatedData);

    // 3. On passe les données saines à la route suivante
    req.cleanData = safeData;
    next();
  } catch (error) {
    // Si Zod détecte une erreur (ex: mauvais format d'email)
    res.status(400).json({ success: false, errors: error.errors });
  }
};
