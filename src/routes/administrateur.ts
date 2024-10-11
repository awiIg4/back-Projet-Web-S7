import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';

config(); // Charger les variables d'environnement

const router = express.Router();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

router.use(cookieParser());

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Route d'inscription pour les administrateurs
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { nom, email, telephone, adresse, motdepasse } = req.body;
  
    try {
      const existingUser = await Utilisateur.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).send('Un utilisateur avec cet email existe déjà.');
        return;
      }
  
      // Créer le nouvel utilisateur sans mot de passe (mot de passe sera stocké dans la table Administrateur)
      const nouvelUtilisateur = await Utilisateur.create({
        nom,
        email,
        telephone,
        adresse,
        type_utilisateur: 'administrateur',
      });
  
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(motdepasse, 10);
  
      // Créer l'entrée associée dans la table Administrateur avec le mot de passe haché
      await Administrateur.create({
        id: nouvelUtilisateur.id, // Référence l'ID de l'utilisateur
        mot_de_passe: hashedPassword,
      });
  
      res.status(201).send('Compte administrateur créé avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création du compte administrateur.');
    }
  });
  

// Route de connexion pour les administrateurs
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, motdepasse } = req.body;
  
    try {
      // Rechercher l'utilisateur par email
      const utilisateur = await Utilisateur.findOne({ where: { email } });
  
      // Vérifier si l'utilisateur existe et si c'est bien un administrateur
      if (!utilisateur || utilisateur.type_utilisateur !== 'administrateur') {
        res.status(400).send('Email ou mot de passe incorrect.');
        return;
      }
  
      // Récupérer le mot de passe depuis la table Administrateur
      const administrateur = await Administrateur.findOne({ where: { utilisateurId: utilisateur.id } });
      if (!administrateur) {
        res.status(400).send('Email ou mot de passe incorrect.');
        return;
      }
  
      const validPassword = await bcrypt.compare(motdepasse, administrateur.mot_de_passe);
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
        path: '/api/administrateurs/refresh-token',
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
        { userId, typeUtilisateur: 'administrateur' },
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

// Route de déconnexion pour les administrateurs
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).send('Déconnexion réussie.');
});

export default router;