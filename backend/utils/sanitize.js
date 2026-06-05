import sanitizeHtml from "sanitize-html";

/**
 * Nettoie une chaîne de caractères en supprimant TOUTES les balises HTML et les scripts.
 * Protection absolue contre les failles XSS (Cross-Site Scripting).
 * @param {string} dirtyInput - La chaîne de caractères potentiellement dangereuse.
 * @returns {string} - La chaîne nettoyée.
 */
export const sanitizeText = (dirtyInput) => {
  if (typeof dirtyInput !== "string") return dirtyInput;

  return sanitizeHtml(dirtyInput, {
    allowedTags: [], // Aucune balise HTML autorisée (ex: supprime <script>, <b>, <img>)
    allowedAttributes: {}, // Aucun attribut autorisé (ex: supprime onclick="", href="")
  });
};

/**
 * Parcourt et nettoie toutes les chaînes de caractères à l'intérieur d'un objet.
 * Idéal pour nettoyer directement un objet `req.body` entier venant du frontend.
 * @param {Object} obj - L'objet contenant les données du formulaire.
 * @returns {Object} - Un nouvel objet totalement nettoyé.
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return sanitizeText(obj);

  const sanitizedObj = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitizedObj[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null) {
      // Appel récursif si l'objet contient des sous-objets
      sanitizedObj[key] = sanitizeObject(value);
    } else {
      // Garde les nombres, booléens, etc. tels quels
      sanitizedObj[key] = value;
    }
  }

  return sanitizedObj;
};
