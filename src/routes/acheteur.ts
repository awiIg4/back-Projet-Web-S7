// src/routes/acheteur.ts

import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import Utilisateur from '../models/utilisateur';
import Acheteur from '../models/acheteur';

config(); // Charger les variables d'environnement

const router = express.Router();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

// Middleware pour parser les cookies
router.use(cookieParser());

// Étendre l'interface Request pour inclure 'user'
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware d'authentification
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).send('Accès refusé. Aucun token fourni.');
    return;
  }

  jwt.verify(token, accessTokenSecret, (err: any, decoded: any) => {
    if (err) {
      res.status(401).send('Token d\'accès invalide ou expiré.');
      return;
    }
    req.user = decoded;
    next();
  });
}

// Route d'inscription pour les acheteurs
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { nom, email, telephone, adresse, motdepasse } = req.body;

  try {
    // Vérifier si l'email existe déjà
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
      motdepasse,
      typeUtilisateur: 'acheteur',
    });

    // Créer l'entrée dans Acheteur
    await Acheteur.create({
      utilisateurId: nouvelUtilisateur.id,
    });

    res.status(201).send('Compte acheteur créé avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création du compte acheteur.');
  }
});

// Route de connexion pour les acheteurs
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, motdepasse } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ where: { email } });

    if (!utilisateur || utilisateur.typeUtilisateur !== 'acheteur') {
      res.status(400).send('Email ou mot de passe incorrect.');
      return;
    }

    const validPassword = await bcrypt.compare(motdepasse, utilisateur.motdepasse);
    if (!validPassword) {
      res.status(400).send('Email ou mot de passe incorrect.');
      return;
    }

    // Générer le token d'accès
    const accessToken = jwt.sign(
      { userId: utilisateur.id, typeUtilisateur: utilisateur.typeUtilisateur },
      accessTokenSecret,
      { expiresIn: '15m' }
    );

    // Générer le refresh token
    const refreshToken = jwt.sign(
      { userId: utilisateur.id },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    // Stocker le refresh token dans la base de données
    utilisateur.refreshToken = refreshToken;
    await utilisateur.save();

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
      path: '/api/acheteurs/refresh-token',
    });

    res.status(200).send('Connexion réussie.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la connexion.');
  }
});

// Route pour rafraîchir le token d'accès
router.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).send('Accès refusé. Aucun refresh token fourni.');
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret) as { userId: number };

    const utilisateur = await Utilisateur.findByPk(decoded.userId);

    if (!utilisateur || utilisateur.refreshToken !== refreshToken) {
      res.status(403).send('Refresh token invalide.');
      return;
    }

    // Générer un nouveau token d'accès
    const newAccessToken = jwt.sign(
      { userId: utilisateur.id, typeUtilisateur: utilisateur.typeUtilisateur },
      accessTokenSecret,
      { expiresIn: '15m' }
    );

    // Optionnel : Générer un nouveau refresh token
    const newRefreshToken = jwt.sign(
      { userId: utilisateur.id },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    // Mettre à jour le refresh token en base de données
    utilisateur.refreshToken = newRefreshToken;
    await utilisateur.save();

    // Mettre à jour les cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/acheteurs/refresh-token',
    });

    res.status(200).send('Token d\'accès rafraîchi avec succès.');
  } catch (error) {
    console.error(error);
    res.status(403).send('Refresh token invalide ou expiré.');
  }
});

// Route de déconnexion
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, refreshTokenSecret) as { userId: number };
      const utilisateur = await Utilisateur.findByPk(decoded.userId);

      if (utilisateur) {
        utilisateur.refreshToken = null;
        await utilisateur.save();
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'invalidation du refresh token:', error);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).send('Déconnexion réussie.');
});

// Route pour récupérer les informations de l'acheteur connecté
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.userId, {
      attributes: { exclude: ['motdepasse', 'refreshToken'] },
    });

    if (!utilisateur || utilisateur.typeUtilisateur !== 'acheteur') {
      res.status(404).send('Acheteur non trouvé.');
      return;
    }

    res.status(200).json(utilisateur);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des informations.');
  }
});

export default router;