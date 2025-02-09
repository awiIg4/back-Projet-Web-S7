import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { body, validationResult } from 'express-validator';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';
import { authenticateToken } from '../middleware/authenticateToken';
import { isAdministrateur } from '../middleware/authorization';

config(); // Charger les variables d'environnement

const router = express.Router();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

router.use(cookieParser());

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware de validation pour l'inscription des gestionnaires
const validateGestionnaireRegister = [
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
    .withMessage('L\'adresse est requise.'),
  body('motdepasse')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères.')
];

// Middleware de validation pour la connexion des gestionnaires
const validateGestionnaireLogin = [
  body('email')
    .isEmail()
    .withMessage('L\'email est invalide.'),
  body('motdepasse')
    .notEmpty()
    .withMessage('Le mot de passe est requis.')
];

// Route d'inscription pour les gestionnaires avec validation
router.post('/register', authenticateToken, isAdministrateur, validateGestionnaireRegister, async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nom, email, telephone, adresse, motdepasse } = req.body;
  
    try {
      const existingUser = await Utilisateur.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).send('Un utilisateur avec cet email existe déjà.');
        return;
      }
  
      // Créer le nouvel utilisateur sans mot de passe (mot de passe sera stocké dans la table Gestionnaire)
      const nouvelUtilisateur = await Utilisateur.create({
        nom,
        email,
        telephone,
        adresse,
        type_utilisateur: 'gestionnaire',
      });
  
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(motdepasse, 10);
  
      // Créer l'entrée associée dans la table Gestionnaire avec le mot de passe haché
      await Administrateur.create({
        id: nouvelUtilisateur.id, // Référence l'ID de l'utilisateur
        mot_de_passe: hashedPassword,
      });
  
      res.status(201).send('Compte gestionnaire créé avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création du compte gestionnaire.');
    }
  });


// Route de connexion pour les gestionnaires avec validation
router.post('/login', validateGestionnaireLogin, async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, motdepasse } = req.body;
  
    try {
      // Rechercher l'utilisateur par email
      const utilisateur = await Utilisateur.findOne({ where: { email } });
  
      // Vérifier si l'utilisateur existe et si c'est bien un gestionnaire
      if (!utilisateur || utilisateur.type_utilisateur !== 'gestionnaire') {
        res.status(400).send('Email ou mot de passe incorrect.');
        return;
      }
  
      // Récupérer le mot de passe depuis la table Administrateur
      const gestionnaire = await Administrateur.findOne({ where: { id: utilisateur.id } });
      if (!gestionnaire) {
        res.status(400).send('Email ou mot de passe incorrect.');
        return;
      }
  
      // Comparer le mot de passe fourni avec le mot de passe haché
      const validPassword = await bcrypt.compare(motdepasse, gestionnaire.mot_de_passe);
      if (!validPassword) {
        res.status(400).send('Email ou mot de passe incorrect.');
        return;
      }
  
      // Générer le token d'accès et le token de rafraîchissement
      const accessToken = jwt.sign(
        { userId: utilisateur.id, typeUtilisateur: utilisateur.type_utilisateur },
        accessTokenSecret,
        { expiresIn: '15m' }
      );
  
      const refreshToken = jwt.sign(
        { userId: utilisateur.id },
        refreshTokenSecret,
        { expiresIn: '7d' }
      );
  
      // Envoyer les tokens dans des cookies sécurisés
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/gestionnaires/refresh-token',
      });
  
      res.status(200).send('Connexion réussie.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la connexion.');
    }
  });  

// Route pour rafraîchir le token d'accès
router.post('/refresh-token', (req: Request, res: Response): void => {
    const refreshToken = req.cookies.refreshToken;
  
    if (!refreshToken) {
      res.status(401).send('Accès refusé. Aucun refresh token fourni.');
      return;
    }
  
    jwt.verify(refreshToken, refreshTokenSecret, (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        res.status(403).send('Refresh token invalide ou expiré.');
        return;
      }
  
      const userId = decoded.userId;
  
      const newAccessToken = jwt.sign(
        { userId, typeUtilisateur: 'gestionnaire' },
        accessTokenSecret,
        { expiresIn: '15m' }
      );
  
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
  
      res.status(200).send('Token d\'accès rafraîchi avec succès.');
    });
  });
  
// Route de déconnexion pour les gestionnaires
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).send('Déconnexion réussie.');
});

export default router;