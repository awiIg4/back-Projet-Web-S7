import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import { body, param, validationResult } from 'express-validator';
import Editeur from '../models/editeur';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';
import { isAdministrateur } from '../middleware/authorization';

config(); // Charger les variables d'environnement

const router = express.Router();

// Middleware de validation pour la création et la mise à jour des éditeurs
const validateEditeur = [
  body('nom')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Le nom de l\'éditeur est requis.'),
];

const validateEditeurParams = [
  param('id')
    .optional()
    .isInt()
    .withMessage('L\'ID doit être un entier.'),
  param('nom')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Le nom doit être une chaîne de caractères non vide.'),
  param('query')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('La requête de recherche doit être une chaîne de caractères non vide.'),
];

// Route pour créer un nouvel éditeur
router.post('/', authenticateToken, isAdministrateur, validateEditeur, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nom } = req.body;

    try {
      const existingEditeur = await Editeur.findOne({ where: { nom } });
      if (existingEditeur) {
        res.status(400).send('Un éditeur avec ce nom existe déjà.');
        return;
      }

      const editeur = await Editeur.create({ nom });
      res.status(201).json(editeur);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création de l\'éditeur.');
    }
  }
);

// Route pour récupérer tous les éditeurs
router.get('/', authenticateToken, isAdministrateur, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const editeurs = await Editeur.findAll();
      res.status(200).json(editeurs);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des éditeurs.');
    }
  }
);

// Route pour récupérer un éditeur par son ID
router.get('/:id', authenticateToken, isAdministrateur, validateEditeurParams, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const editeur = await Editeur.findByPk(id);
      if (!editeur) {
        res.status(404).send('Éditeur introuvable.');
        return;
      }

      res.status(200).json(editeur);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération de l\'éditeur.');
    }
  }
);

// Route pour récupérer un éditeur par son nom
router.get('/by-name/:nom', authenticateToken, isAdministrateur, validateEditeurParams, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nom } = req.params;

    try {
      const editeur = await Editeur.findOne({ where: { nom } });
      if (!editeur) {
        res.status(404).send('Éditeur introuvable.');
        return;
      }

      res.status(200).json(editeur);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération de l\'éditeur.');
    }
  }
);

// Route pour rechercher les 5 premiers éditeurs par nom (sans sécurité)
router.get('/search/:query', validateEditeurParams, async (req: Request, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { query } = req.params;

    try {
      const editeurs = await Editeur.findAll({
        where: {
          nom: {
            [Op.iLike]: `${query}%`,
          },
        },
        limit: 5,
      });

      res.status(200).json(editeurs);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la recherche des éditeurs.');
    }
  }
);

// Route pour mettre à jour un éditeur
router.put('/:id', authenticateToken, isAdministrateur,
  [
    ...validateEditeurParams,
    body('nom')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Le nom doit être une chaîne de caractères non vide.'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { nom } = req.body;

    try {
      const editeur = await Editeur.findByPk(id);
      if (!editeur) {
        res.status(404).send('Éditeur introuvable.');
        return;
      }

      if (nom) {
        const existingEditeur = await Editeur.findOne({
          where: { nom, id: { [Op.ne]: id } },
        });
        if (existingEditeur) {
          res.status(400).send('Un autre éditeur avec ce nom existe déjà.');
          return;
        }
      }

      editeur.nom = nom || editeur.nom;
      await editeur.save();

      res.status(200).json(editeur);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la mise à jour de l\'éditeur.');
    }
  }
);

// Route pour supprimer un éditeur
router.delete('/:id', authenticateToken, isAdministrateur, validateEditeurParams, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const editeur = await Editeur.findByPk(id);
      if (!editeur) {
        res.status(404).send('Éditeur introuvable.');
        return;
      }

      await editeur.destroy();
      res.status(200).send('Éditeur supprimé avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la suppression de l\'éditeur.');
    }
  }
);

export default router;