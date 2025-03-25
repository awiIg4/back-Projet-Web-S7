import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import Session from '../models/session'; // Assurez-vous que ce chemin est correct
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';
import { body, param, validationResult } from 'express-validator';

config(); // Charger les variables d'environnement

const router = express.Router();

// Middleware de validation pour la création des sessions
const validateCreateSession = [
  body('date_debut')
    .isISO8601()
    .withMessage('La date de début doit être une date valide au format ISO8601.'),
  body('date_fin')
    .isISO8601()
    .withMessage('La date de fin doit être une date valide au format ISO8601.')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.date_debut)) {
        throw new Error('La date de fin doit être postérieure à la date de début.');
      }
      return true;
    }),
  body('valeur_commission')
    .isInt({ min: 0 })
    .withMessage('La valeur de la commission doit être un entier positif.'),
  body('commission_en_pourcentage')
    .isBoolean()
    .withMessage('Le champ commission_en_pourcentage doit être un booléen.'),
  body('valeur_frais_depot')
    .isInt({ min: 0 })
    .withMessage('La valeur des frais de dépôt doit être un entier positif.'),
  body('frais_depot_en_pourcentage')
    .isBoolean()
    .withMessage('Le champ frais_depot_en_pourcentage doit être un booléen.'),
];

// Middleware de validation pour la mise à jour des sessions
const validateUpdateSession = [
  param('id')
    .isInt()
    .withMessage('L\'ID de la session doit être un entier.'),
  body('date_debut')
    .optional()
    .isISO8601()
    .withMessage('La date de début doit être une date valide au format ISO8601.'),
  body('date_fin')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être une date valide au format ISO8601.')
    .custom((value, { req }) => {
      if (req.body.date_debut && new Date(value) <= new Date(req.body.date_debut)) {
        throw new Error('La date de fin doit être postérieure à la date de début.');
      }
      return true;
    }),
  body('valeur_commission')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La valeur de la commission doit être un entier positif.'),
  body('commission_en_pourcentage')
    .optional()
    .isBoolean()
    .withMessage('Le champ commission_en_pourcentage doit être un booléen.'),
  body('valeur_frais_depot')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La valeur des frais de dépôt doit être un entier positif.'),
  body('frais_depot_en_pourcentage')
    .optional()
    .isBoolean()
    .withMessage('Le champ frais_depot_en_pourcentage doit être un booléen.'),
];

// Middleware de validation pour les paramètres ID
const validateSessionId = [
  param('id')
    .isInt()
    .withMessage('L\'ID de la session doit être un entier.'),
];

// Route pour créer une nouvelle session
router.post(
  '/',
  authenticateToken,,
  validateCreateSession,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      date_debut,
      date_fin,
      valeur_commission,
      commission_en_pourcentage,
      valeur_frais_depot,
      frais_depot_en_pourcentage,
    } = req.body;

    try {
      const session = await Session.create({
        date_debut,
        date_fin,
        valeur_commission,
        commission_en_pourcentage,
        valeur_frais_depot,
        frais_depot_en_pourcentage,
      });

      res.status(201).json(session);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création de la session.');
    }
  }
);

// Route pour récupérer toutes les sessions
router.get(
  '/',
  authenticateToken,,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessions = await Session.findAll();
      res.status(200).json(sessions);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des sessions.');
    }
  }
);

// Route pour récupérer la session courante
router.get('/current', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const session = await Session.findOne({
      where: {
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today },
      },
    });

    if (!session) {
      res.status(404).send('Aucune session courante.');
      return;
    }

    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de la session courante.');
  }
}
);

// Route pour récupérer une session par son ID
router.get('/:id', authenticateToken, validateSessionId, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const session = await Session.findByPk(id);
      if (!session) {
        res.status(404).send('Session introuvable.');
        return;
      }

      res.status(200).json(session);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération de la session.');
    }
  }
);

// Route pour mettre à jour une session
router.put('/:id', authenticateToken, validateUpdateSession, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const {
      date_debut,
      date_fin,
      valeur_commission,
      commission_en_pourcentage,
      valeur_frais_depot,
      frais_depot_en_pourcentage,
    } = req.body;

    try {
      const session = await Session.findByPk(id);
      if (!session) {
        res.status(404).send('Session introuvable.');
        return;
      }

      if (date_debut !== undefined) session.date_debut = date_debut;
      if (date_fin !== undefined) session.date_fin = date_fin;
      if (valeur_commission !== undefined) session.valeur_commission = valeur_commission;
      if (commission_en_pourcentage !== undefined)
        session.commission_en_pourcentage = commission_en_pourcentage;
      if (valeur_frais_depot !== undefined) session.valeur_frais_depot = valeur_frais_depot;
      if (frais_depot_en_pourcentage !== undefined)
        session.frais_depot_en_pourcentage = frais_depot_en_pourcentage;

      await session.save();

      res.status(200).json(session);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la mise à jour de la session.');
    }
  }
);

// Route pour supprimer une session
router.delete('/:id', authenticateToken, validateSessionId, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const session = await Session.findByPk(id);
      if (!session) {
        res.status(404).send('Session introuvable.');
        return;
      }

      await session.destroy();
      res.status(200).send('Session supprimée avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la suppression de la session.');
    }
  }
);

export default router;