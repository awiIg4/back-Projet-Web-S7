import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import Utilisateur from '../models/utilisateur';
import Acheteur from '../models/acheteur';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route pour créer un acheteur avec un email unique
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
});

// Route pour charger un acheteur grâce à son email
router.get('/:email', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;

  try {
    const utilisateur = await Utilisateur.findOne({
      where: { email, type_utilisateur: 'acheteur' },
      include: [{ model: Acheteur, as: 'acheteur' }],
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
});

export default router;