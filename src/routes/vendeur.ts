// src/routes/vendeur.ts

import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from '../models/utilisateur';
import Vendeur, { VendeurCreationAttributes } from '../models/vendeur';
import Jeu from '../models/jeu';
import Depot from '../models/depot';
import Somme from '../models/somme';
import Licence from '../models/licence';
import Session from '../models/session';
import { isAdminOrManager } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Étendre l'interface Request pour inclure 'user'
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    typeUtilisateur: string;
  };
}

// Route pour créer un vendeur avec un email unique
router.post('/register', async (req: Request, res: Response): Promise<void> => {
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
      type_utilisateur: 'vendeur',
    });

    // Créer l'entrée associée dans la table Vendeur
    await Vendeur.create({
      id: nouvelUtilisateur.id,
    } as VendeurCreationAttributes);

    res.status(201).send('Compte vendeur créé avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création du compte vendeur.');
  }
});

// Route pour récupérer les jeux vendus et en vente pour une session
router.get(
  '/stock/:idsession',
  isAdminOrManager,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const idsession = Number(req.params.idsession);
    const numpage = Number(req.query.numpage) || 1;

    if (isNaN(idsession) || isNaN(numpage)) {
      res.status(400).send('idsession ou numpage invalide.');
      return;
    }

    try {
      // Votre logique ici
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des jeux pour la session.');
    }
  }
);

// Route pour récupérer la somme due au vendeur pour une session
router.get(
  '/sommedue/:idsession',
  isAdminOrManager,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.query.idvendeur);

    if (isNaN(idsession) || isNaN(idvendeur)) {
      res.status(400).send('idsession ou idvendeur invalide.');
      return;
    }

    try {
      // Votre logique ici
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération de la somme due.');
    }
  }
);

// Route pour récupérer l'argent généré par les ventes pour une session
router.get(
  '/argentgagne/:idsession',
  isAdminOrManager,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.query.idvendeur);

    if (isNaN(idsession) || isNaN(idvendeur)) {
      res.status(400).send('idsession ou idvendeur invalide.');
      return;
    }

    try {
      // Votre logique ici
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la récupération de l'argent généré.");
    }
  }
);

// Les autres routes restent inchangées

export default router;