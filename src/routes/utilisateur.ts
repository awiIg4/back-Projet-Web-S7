import express, { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticateToken';
import { authenticateToken } from '../middleware/authenticateToken';
import Utilisateur from '../models/utilisateur';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const utilisateurs = await Utilisateur.findAll();
    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des utilisateurs.');
  }
});

router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { nom, telephone, adresse } = req.body;

  try {
    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      res.status(404).send('Utilisateur introuvable.');
      return;
    }

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

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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