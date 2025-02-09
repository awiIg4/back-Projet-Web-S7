import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import CodePromo from '../models/codePromotion';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';
import { isAdminOrManager, isAdministrateur } from '../middleware/authorization';
import { body, param, validationResult } from 'express-validator';

config(); // Charger les variables d'environnement

const router = express.Router();

// Middleware de validation pour la création et la mise à jour des codes promo
const validateCodePromo = [
  body('libelle')
    .isString()
    .notEmpty()
    .withMessage('Le libellé du code promo est requis.'),
  body('reductionPourcent')
    .isInt({ min: 0, max: 100 })
    .withMessage('La réduction doit être un entier entre 0 et 100.'),
];

const validateLibelle = [
  param('libelle')
    .isString()
    .notEmpty()
    .withMessage('Le libellé du code promo doit être une chaîne de caractères non vide.'),
];

const validateSearchQuery = [
  param('query')
    .isString()
    .notEmpty()
    .withMessage('La requête de recherche doit être une chaîne de caractères non vide.'),
];

// Route pour récupérer tous les codes promo (administrateur et gestionnaire uniquement)
router.get('/', authenticateToken, isAdminOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const codesPromo = await CodePromo.findAll();
      res.status(200).json(codesPromo);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des codes promo.');
    }
  }
);

// Route pour récupérer la réduction associée à un code promo (administrateur et gestionnaire uniquement)
router.get('/:codepromo', authenticateToken, isAdminOrManager,
  [
    param('codepromo')
      .isString()
      .notEmpty()
      .withMessage('Le code promo doit être une chaîne de caractères non vide.'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { codepromo } = req.params;

    try {
      const codePromo = await CodePromo.findOne({ where: { libelle: codepromo } });
      if (!codePromo) {
        res.status(404).send('Code promo introuvable.');
        return;
      }

      res.status(200).json({ reduction: codePromo.reductionPourcent });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération du code promo.');
    }
  }
);

// Route pour créer un nouveau code promo (administrateur uniquement)
router.post('/', authenticateToken, isAdministrateur, validateCodePromo, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { libelle, reductionPourcent } = req.body;

    try {
      const existingCodePromo = await CodePromo.findOne({ where: { libelle } });
      if (existingCodePromo) {
        res.status(400).send('Un code promo avec ce libellé existe déjà.');
        return;
      }

      const codePromo = await CodePromo.create({ libelle, reductionPourcent });
      res.status(201).json(codePromo);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création du code promo.');
    }
  }
);

// Route pour mettre à jour un code promo (administrateur uniquement)
router.put('/:libelle', authenticateToken, isAdministrateur,
  [
    ...validateLibelle,
    body('libelle')
      .optional()
      .isString()
      .notEmpty()
      .withMessage('Le libellé du code promo doit être une chaîne de caractères non vide.'),
    body('reductionPourcent')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('La réduction doit être un entier entre 0 et 100.'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { libelle } = req.params;
    const { libelle: newLibelle, reductionPourcent } = req.body;

    try {
      const codePromo = await CodePromo.findOne({ where: { libelle } });
      if (!codePromo) {
        res.status(404).send('Code promo introuvable.');
        return;
      }

      if (newLibelle) {
        const existingCodePromo = await CodePromo.findOne({
          where: { libelle: newLibelle },
        });
        if (existingCodePromo && existingCodePromo.libelle !== libelle) {
          res.status(400).send('Un autre code promo avec ce libellé existe déjà.');
          return;
        }
        codePromo.libelle = newLibelle;
      }

      if (reductionPourcent !== undefined) {
        codePromo.reductionPourcent = reductionPourcent;
      }

      await codePromo.save();

      res.status(200).json(codePromo);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la mise à jour du code promo.');
    }
  }
);

// Route pour supprimer un code promo (administrateur uniquement)
router.delete('/:libelle', authenticateToken, isAdministrateur, validateLibelle, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { libelle } = req.params;

    try {
      const codePromo = await CodePromo.findOne({ where: { libelle } });
      if (!codePromo) {
        res.status(404).send('Code promo introuvable.');
        return;
      }

      await codePromo.destroy();
      res.status(200).send('Code promo supprimé avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la suppression du code promo.');
    }
  }
);

// Route pour rechercher les 5 premiers codes promo par libellé (sans sécurité)
router.get('/search/:query', validateSearchQuery, async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { query } = req.params;

    try {
      const codesPromo = await CodePromo.findAll({
        where: {
          libelle: {
            [Op.iLike]: `${query}%`,
          },
        },
        limit: 5,
      });

      res.status(200).json(codesPromo);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la recherche des codes promo.');
    }
  }
);

export default router;