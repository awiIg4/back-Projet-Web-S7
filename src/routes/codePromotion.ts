// src/routes/codePromotion.ts

import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import CodePromotion, { CodePromotionCreationAttributes } from '../models/codePromotion';
import { isAdministrateur, isAdminOrManager } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route pour récupérer la réduction associée à un code promo
router.get('/:codepromo', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  const { codepromo } = req.params;

  try {
    const codePromo = await CodePromotion.findOne({ where: { libelle: codepromo } });
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
    const existingCodePromo = await CodePromotion.findOne({ where: { libelle } });
    if (existingCodePromo) {
      res.status(400).send('Un code promo avec ce libellé existe déjà.');
      return;
    }

    const codePromo = await CodePromotion.create({ libelle, reductionPourcent } as CodePromotionCreationAttributes);
    res.status(201).json(codePromo);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création du code promo.');
  }
});

// Les autres routes restent inchangées

export default router;
