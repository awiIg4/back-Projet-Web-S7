import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import Utilisateur from '../models/utilisateur';
import { isAdministrateur } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route pour récupérer tous les utilisateurs (administrateur uniquement)
router.get('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  try {
    const utilisateurs = await Utilisateur.findAll();
    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des utilisateurs.');
  }
});

// Route pour mettre à jour un utilisateur (administrateur uniquement)
router.put('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nom, telephone, adresse } = req.body;

  try {
    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      res.status(404).send('Utilisateur introuvable.');
      return;
    }

    // Mettre à jour les informations de l'utilisateur (sauf l'email)
    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.telephone = telephone || utilisateur.telephone;
    utilisateur.adresse = adresse || utilisateur.adresse;

    await utilisateur.save();

    res.status(200).json(utilisateur);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de l\'utilisateur.');
  }
});

// Route pour supprimer un utilisateur (administrateur uniquement)
router.delete('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      res.status(404).send('Utilisateur introuvable.');
      return;
    }

    await utilisateur.destroy();
    res.status(200).send('Utilisateur supprimé avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de l\'utilisateur.');
  }
});

export default router;