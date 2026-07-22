import { z } from 'zod';

// ── Schémas Zod ──────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(80, 'Le nom ne peut dépasser 80 caractères.')
    .regex(/^[\p{L}\s'-]+$/u, 'Le nom contient des caractères non autorisés.'),
  email: z
    .string()
    .email('Adresse courriel invalide.')
    .max(254, 'Adresse courriel trop longue.'),
  subject: z
    .string()
    .min(3, 'Le sujet doit contenir au moins 3 caractères.')
    .max(120, 'Le sujet ne peut dépasser 120 caractères.'),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères.')
    .max(2000, 'Le message ne peut dépasser 2000 caractères.'),
});

const ticketRequestSchema = z.object({
  ticketType: z.enum(['visiteur', 'joueur', 'competiteur'], {
    errorMap: () => ({ message: 'Type de billet invalide.' }),
  }),
  quantity: z
    .number({ invalid_type_error: 'La quantité doit être un nombre.' })
    .int()
    .min(1, 'Minimum 1 billet.')
    .max(10, 'Maximum 10 billets par transaction.'),
  consent: z
    .literal(true, { errorMap: () => ({ message: 'Vous devez accepter les conditions.' }) }),
});

const chatSchema = z.object({
  message: z
    .string({ required_error: 'Message requis.' })
    .min(1, 'Message vide.')
    .max(500, 'Message trop long (500 caractères max).'),
});

// ── Middleware Factory ────────────────────────────────────────────────────────

function createValidator(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({ success: false, errors });
    }
    req.body = result.data;
    next();
  };
}

export const validateContact = createValidator(contactSchema);
export const validateTicketRequest = createValidator(ticketRequestSchema);
export const validateChat = createValidator(chatSchema);
