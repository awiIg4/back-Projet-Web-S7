import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import Session from '../models/session';
import { isAdministrateur } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route pour créer une nouvelle session
router.post('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const {
    date_debut,
    date_fin,
    valeur_commission,
    commission_en_pourcentage,
    valeur_frais_depot,
    frais_depot_en_pourcentage,
  } = req.body;

  try {
    const session = await Session.create<Session>({
      date_debut,
      date_fin,
      valeur_commission,
      commission_en_pourcentage,
      valeur_frais_depot,
      frais_depot_en_pourcentage,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création de la session.');
  }
});

// Route pour récupérer toutes les sessions
router.get('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await Session.findAll();
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des sessions.');
  }
});

// Route pour récupérer une session par son ID
router.get('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const session = await Session.findByPk(id);
    if (!session) {
      res.status(404).send('Session introuvable.');
      return;
    }

    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de la session.');
  }
});

// Route pour récupérer la session courante
router.get('/current', async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const session = await Session.findOne({
      where: {
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today },
      },
    });

    if (!session) {
      res.status(404).send('Aucune session courante.');
      return;
    }

    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de la session courante.');
  }
});

// Route pour mettre à jour une session
router.put('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    date_debut,
    date_fin,
    valeur_commission,
    commission_en_pourcentage,
    valeur_frais_depot,
    frais_depot_en_pourcentage,
  } = req.body;

  try {
    const session = await Session.findByPk(id);
    if (!session) {
      res.status(404).send('Session introuvable.');
      return;
    }

    session.date_debut = date_debut || session.date_debut;
    session.date_fin = date_fin || session.date_fin;
    session.valeur_commission = valeur_commission || session.valeur_commission;
    session.commission_en_pourcentage = commission_en_pourcentage ?? session.commission_en_pourcentage;
    session.valeur_frais_depot = valeur_frais_depot || session.valeur_frais_depot;
    session.frais_depot_en_pourcentage = frais_depot_en_pourcentage ?? session.frais_depot_en_pourcentage;

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de la session.');
  }
});

// Route pour supprimer une session
router.delete('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const session = await Session.findByPk(id);
    if (!session) {
      res.status(404).send('Session introuvable.');
      return;
    }

    await session.destroy();
    res.status(200).send('Session supprimée avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de la session.');
  }
});

export default router;