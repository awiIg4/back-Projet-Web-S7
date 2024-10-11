// src/routes/stats.ts

import express, { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import Achat from '../models/achat';
import Jeu from '../models/jeu';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import Session from '../models/session';
import { isAdminOrManager } from './middleware';

const router = express.Router();

// Route GET /jeu
router.get('/jeu', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id, editeur_id, licence_id } = req.query;

    if (!session_id) {
      res.status(400).send('Le paramètre session_id est requis.');
      return;
    }

    // Vérifier l'existence de la session
    const session = await Session.findByPk(session_id as string);
    if (!session) {
      res.status(404).send('Session introuvable.');
      return;
    }

    // Construire la clause WHERE pour le filtre de date
    const whereClause: any = {
      date_transaction: {
        [Op.between]: [session.date_debut, session.date_fin],
      },
    };

    // Inclure les filtres pour éditeur et licence si fournis
    const includeClause: any[] = [
      {
        model: Jeu,
        as: 'jeu',
        include: [
          {
            model: Licence,
            as: 'licence',
            attributes: ['id', 'nom', 'editeur_id'],
            where: {},
            include: [
              {
                model: Editeur,
                as: 'editeur',
                attributes: ['id', 'nom'],
                where: {},
              },
            ],
          },
        ],
      },
    ];

    if (licence_id) {
      includeClause[0].include[0].where.id = licence_id;
    }

    if (editeur_id) {
      includeClause[0].include[0].include[0].where.id = editeur_id;
    }

    // Récupérer les données
    const ventesParJour = await Achat.findAll({
      where: whereClause,
      include: includeClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('date_transaction')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('Achat.id')), 'nombre_ventes'],
        [Sequelize.fn('SUM', Sequelize.col('commission')), 'total_commission'],
        [Sequelize.fn('SUM', Sequelize.col('jeu.prix')), 'total_ventes'],
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('date_transaction'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('date_transaction')), 'ASC']],
    });

    res.status(200).json(ventesParJour);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des statistiques.');
  }
});

// Route GET /taxes
router.get('/taxes', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      res.status(400).send('Le paramètre session_id est requis.');
      return;
    }

    // Vérifier l'existence de la session
    const session = await Session.findByPk(session_id as string);
    if (!session) {
      res.status(404).send('Session introuvable.');
      return;
    }

    // Construire la clause WHERE pour le filtre de date
    const whereClause: any = {
      date_transaction: {
        [Op.between]: [session.date_debut, session.date_fin],
      },
    };

    // Récupérer les données
    const taxesParHeure = await Achat.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('date_transaction'), '%Y-%m-%d %H:00:00'), 'heure'],
        [Sequelize.fn('SUM', Sequelize.col('commission')), 'total_commission'],
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('date_transaction'), '%Y-%m-%d %H:00:00')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('date_transaction'), '%Y-%m-%d %H:00:00'), 'ASC']],
    });

    res.status(200).json(taxesParHeure);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des statistiques de taxes.');
  }
});

export default router;