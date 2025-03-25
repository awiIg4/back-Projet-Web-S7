import express, { Response } from 'express';
import { config } from 'dotenv';
import { body, validationResult } from 'express-validator';
import Utilisateur from '../models/utilisateur';
import Acheteur from '../models/acheteur';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';

config(); // Charger les variables d'environnement

const router = express.Router();

// Middleware de validation pour la création d'un acheteur
const validateAcheteurRegister = [
  body('nom')
    .notEmpty()
    .withMessage('Le nom est requis.'),
  body('email')
    .isEmail()
    .withMessage('L\'email est invalide.'),
  body('telephone')
    .isLength({ min: 10 })
    .withMessage('Le numéro de téléphone doit contenir au moins 10 chiffres.'),
  body('adresse')
    .notEmpty()
    .withMessage('L\'adresse est requise.')
];

// Route pour créer un acheteur avec un email unique et validation
router.post('/register', authenticateToken, validateAcheteurRegister, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nom, email, telephone, adresse } = req.body;

    try {
      // Vérifier si un utilisateur avec cet email existe déjà
      const existingUser = await Utilisateur.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).send('Un utilisateur avec cet email existe déjà.');
        return;
      }

      // Créer le nouvel utilisateur
      const nouvelUtilisateur = await Utilisateur.create({
        nom,
        email,
        telephone,
        adresse,
        type_utilisateur: 'acheteur',
      });

      // Créer l'entrée associée dans la table Acheteur
      await Acheteur.create({
        id: nouvelUtilisateur.id,
      });

      res.status(201).send('Compte acheteur créé avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création du compte acheteur.');
    }
  }
);

// Middleware de validation pour la récupération d'un acheteur par email
const validateAcheteurGet = [
  body('email')
    .isEmail()
    .withMessage('L\'email est invalide.')
];

// Route pour charger un acheteur grâce à son email avec validation
router.get('/:email', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email } = req.params;

    // Optionnel : Valider le paramètre email via express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const utilisateur = await Utilisateur.findOne({
        where: { email, type_utilisateur: 'acheteur' },
      });

      if (!utilisateur) {
        res.status(404).send('Acheteur non trouvé.');
        return;
      }

      res.status(200).json(utilisateur);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors du chargement de l\'acheteur.');
    }
  }
);

export default router;