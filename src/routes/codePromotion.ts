import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import CodePromo from '../models/codePromotion';
import { isAdministrateur, isAdminOrManager } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route pour récupérer tous les codes promo (administrateur et gestionnaire uniquement)
router.get('/', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  try {
    const codesPromo = await CodePromo.findAll();
    res.status(200).json(codesPromo);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des codes promo.');
  }
});

// Route pour récupérer la réduction associée à un code promo
router.get('/:codepromo', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  const { codepromo } = req.params;

  try {
    const codePromo = await CodePromo.findOne({ where: { libelle: codepromo } });
    if (!codePromo) {
      res.status(404).send('Code promo introuvable.');
      return;
    }

    res.status(200).json({ reduction: codePromo.reductionPourcent });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération du code promo.');
  }
});

// Route pour créer un nouveau code promo (administrateur uniquement)
router.post('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { libelle, reductionPourcent } = req.body;

  try {
    const existingCodePromo = await CodePromo.findOne({ where: { libelle } });
    if (existingCodePromo) {
      res.status(400).send('Un code promo avec ce libellé existe déjà.');
      return;
    }

    const codePromo = await CodePromo.create({ libelle, reductionPourcent });
    res.status(201).json(codePromo);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création du code promo.');
  }
});

// Route pour mettre à jour un code promo (administrateur uniquement)
router.put('/:libelle', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { libelle } = req.params;
  const { reductionPourcent } = req.body;

  try {
    const codePromo = await CodePromo.findOne({ where: { libelle } });
    if (!codePromo) {
      res.status(404).send('Code promo introuvable.');
      return;
    }

    codePromo.reductionPourcent = reductionPourcent;
    await codePromo.save();

    res.status(200).json(codePromo);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour du code promo.');
  }
});

// Route pour supprimer un code promo (administrateur uniquement)
router.delete('/:libelle', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { libelle } = req.params;

  try {
    const codePromo = await CodePromo.findOne({ where: { libelle } });
    if (!codePromo) {
      res.status(404).send('Code promo introuvable.');
      return;
    }

    await codePromo.destroy();
    res.status(200).send('Code promo supprimé avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression du code promo.');
  }
});

export default router;