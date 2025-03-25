import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import { body, param, validationResult } from 'express-validator';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';

config(); // Charger les variables d'environnement

const router = express.Router();

// Middleware de validation pour la création et la mise à jour des licences
const validateLicence = [
  body('nom')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Le nom de la licence est requis.'),
  body('editeur_id')
    .isInt()
    .withMessage('L\'ID de l\'éditeur doit être un entier.'),
];

const validateLicenceParams = [
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

// Route pour créer une nouvelle licence (Administrateur uniquement)
router.post('/', authenticateToken, validateLicence, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nom, editeur_id } = req.body;

    try {
      const existingLicence = await Licence.findOne({ where: { nom } });
      if (existingLicence) {
        res.status(400).send('Une licence avec ce nom existe déjà.');
        return;
      }

      const editeur = await Editeur.findByPk(editeur_id);
      if (!editeur) {
        res.status(400).send('Éditeur introuvable.');
        return;
      }

      const licence = await Licence.create({ nom, editeur_id });
      res.status(201).json(licence);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création de la licence.');
    }
  }
);

// Route pour récupérer toutes les licences (Administrateur uniquement)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const licences = await Licence.findAll({ include: [{ model: Editeur, as: 'editeur' }] });
      res.status(200).json(licences);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des licences.');
    }
  }
);

// Route pour récupérer une licence par son ID (Administrateur uniquement)
router.get('/:id', authenticateToken, validateLicenceParams, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const licence = await Licence.findByPk(id, { include: [{ model: Editeur, as: 'editeur' }] });
      if (!licence) {
        res.status(404).send('Licence introuvable.');
        return;
      }

      res.status(200).json(licence);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération de la licence.');
    }
  }
);

// Route pour récupérer une licence par son nom (Administrateur uniquement)
router.get('/by-name/:nom', authenticateToken, validateLicenceParams, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nom } = req.params;

    try {
      const licence = await Licence.findOne({ where: { nom }, include: [{ model: Editeur, as: 'editeur' }] });
      if (!licence) {
        res.status(404).send('Licence introuvable.');
        return;
      }

      res.status(200).json(licence);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération de la licence.');
    }
  }
);

// Route pour rechercher les 5 premières licences par nom (Sans sécurité)
router.get('/search/:query', validateLicenceParams, async (req: Request, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { query } = req.params;

    try {
      const licences = await Licence.findAll({
        where: {
          nom: {
            [Op.iLike]: `${query}%`,
          },
        },
        limit: 5,
        include: [{ model: Editeur, as: 'editeur' }],
      });

      res.status(200).json(licences);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la recherche des licences.');
    }
  }
);

// Route pour mettre à jour une licence (Administrateur uniquement)
router.put('/:id', authenticateToken,
  [
    ...validateLicenceParams,
    body('nom')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Le nom doit être une chaîne de caractères non vide.'),
    body('editeur_id')
      .optional()
      .isInt()
      .withMessage('L\'ID de l\'éditeur doit être un entier.'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { nom, editeur_id } = req.body;

    try {
      const licence = await Licence.findByPk(id);
      if (!licence) {
        res.status(404).send('Licence introuvable.');
        return;
      }

      if (nom) {
        const existingLicence = await Licence.findOne({ where: { nom, id: { [Op.ne]: id } } });
        if (existingLicence) {
          res.status(400).send('Une autre licence avec ce nom existe déjà.');
          return;
        }
      }

      if (editeur_id) {
        const editeur = await Editeur.findByPk(editeur_id);
        if (!editeur) {
          res.status(400).send('Éditeur introuvable.');
          return;
        }
      }

      licence.nom = nom || licence.nom;
      licence.editeur_id = editeur_id || licence.editeur_id;
      await licence.save();

      res.status(200).json(licence);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la mise à jour de la licence.');
    }
  }
);

// Route pour supprimer une licence (Administrateur uniquement)
router.delete('/:id', authenticateToken, validateLicenceParams, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const licence = await Licence.findByPk(id);
      if (!licence) {
        res.status(404).send('Licence introuvable.');
        return;
      }

      await licence.destroy();
      res.status(200).send('Licence supprimée avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la suppression de la licence.');
    }
  }
);

export default router;