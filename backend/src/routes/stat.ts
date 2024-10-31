import express, { Request, Response } from '../../backend/node_modules/@types/express';
import { Op, Sequelize } from 'sequelize';
import Achat from '../models/achat';
import Jeu from '../models/jeu';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import SessionModel from '../models/session'; // Renommé pour éviter les conflits
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';
import { isAdminOrManager } from '../middleware/authorization';
import { query, validationResult } from 'express-validator';

const router = express.Router();

// Middleware de validation pour la route GET /jeu
const validateJeu = [
  query('session_id')
    .exists().withMessage('Le paramètre session_id est requis.')
    .bail()
    .isInt().withMessage('Le paramètre session_id doit être un entier.'),
  query('editeur_id')
    .optional()
    .isInt().withMessage('Le paramètre editeur_id doit être un entier.'),
  query('licence_id')
    .optional()
    .isInt().withMessage('Le paramètre licence_id doit être un entier.'),
];

// Route pour récupérer les stats sur les jeux
router.get('/jeux', authenticateToken, isAdminOrManager, validateJeu, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { session_id, editeur_id, licence_id } = req.query;
    const sessionId = Number(session_id);
    const editeurId = editeur_id ? Number(editeur_id) : undefined;
    const licenceId = licence_id ? Number(licence_id) : undefined;

    const session = await SessionModel.findByPk(sessionId);
    if (!session) {
      res.status(404).send('Session introuvable.');
      return;
    }

    const whereClause: any = {
      date_transaction: {
        [Op.between]: [session.date_debut, session.date_fin],
      },
    };

    const includeClause: any[] = [
      {
        model: Jeu,
        as: 'jeu',
        include: [
          {
            model: Licence,
            as: 'licence',
            attributes: ['id', 'nom', 'editeur_id'],
            where: licenceId ? { id: licenceId } : undefined,
            include: [
              {
                model: Editeur,
                as: 'editeur',
                attributes: ['id', 'nom'],
                where: editeurId ? { id: editeurId } : undefined,
              },
            ],
          },
        ],
      },
    ];

    const ventesParJour = await Achat.findAll({
      where: whereClause,
      include: includeClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('date_transaction')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('Achat.id')), 'nombre_ventes'],
        [Sequelize.fn('SUM', Sequelize.col('commission')), 'total_commission'],
        [Sequelize.fn('SUM', Sequelize.col('jeu.prix')), 'total_ventes'],
      ],
      group: [
        Sequelize.fn('DATE', Sequelize.col('date_transaction')),
        Sequelize.col('jeu.id'),
        Sequelize.col('jeu.licence_id'),
        Sequelize.col('jeu.prix'),
        Sequelize.col('jeu.statut'),
        Sequelize.col('jeu.depot_id'),
        Sequelize.col('jeu.createdAt'),
        Sequelize.col('jeu.updatedAt'),
        Sequelize.col('jeu->licence.id'),
        Sequelize.col('jeu->licence.nom'),
        Sequelize.col('jeu->licence.editeur_id'),
        Sequelize.col('jeu->licence->editeur.id'),
        Sequelize.col('jeu->licence->editeur.nom'),
      ],
      order: [[Sequelize.fn('DATE', Sequelize.col('date_transaction')), 'ASC']],
    });

    res.status(200).json(ventesParJour);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des statistiques.');
  }
}
);

// Middleware de validation pour la route GET /taxes
const validateTaxes = [
  query('session_id')
    .exists().withMessage('Le paramètre session_id est requis.')
    .bail()
    .isInt().withMessage('Le paramètre session_id doit être un entier.'),
];

// Route pour récuperer les stats sur les taxes
router.get('/taxes', authenticateToken, isAdminOrManager, validateTaxes, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { session_id } = req.query;
    const sessionId = Number(session_id);
    const session = await SessionModel.findByPk(sessionId);
    if (!session) {
      res.status(404).send('Session introuvable.');
      return;
    }

    const whereClause: any = {
      date_transaction: {
        [Op.between]: [session.date_debut, session.date_fin],
      },
    };

    // Inclure également le total des ventes pour chaque heure
    const taxesParHeure = await Achat.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('TO_CHAR', Sequelize.col('date_transaction'), 'YYYY-MM-DD HH24:00:00'), 'heure'],
        [Sequelize.fn('SUM', Sequelize.col('commission')), 'total_commission'],
        [Sequelize.fn('SUM', Sequelize.col('jeu.prix')), 'total_ventes'], // Inclure les ventes ici
      ],
      include: [
        {
          model: Jeu,
          attributes: [],
        },
      ],
      group: [Sequelize.fn('TO_CHAR', Sequelize.col('date_transaction'), 'YYYY-MM-DD HH24:00:00')],
      order: [[Sequelize.fn('TO_CHAR', Sequelize.col('date_transaction'), 'YYYY-MM-DD HH24:00:00'), 'ASC']],
    });

    res.status(200).json(taxesParHeure);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des statistiques de taxes.');
  }
});

export default router;