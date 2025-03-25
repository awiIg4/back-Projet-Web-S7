import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op, Sequelize } from 'sequelize';
import Jeu from '../models/jeu';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import Vendeur from '../models/vendeur';
import Utilisateur from '../models/utilisateur';
import Depot from '../models/depot';
import SessionModel from '../models/session';
import Somme from '../models/somme';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';
import { param, query, validationResult } from 'express-validator';

config(); // Charger les variables d'environnement

const router = express.Router();

// Middleware de gestion des erreurs de validation
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Route GET /gestion/games/:numpage avec validation et middlewares
router.get(
  '/games/:numpage',
  authenticateToken,,
  [
    param('numpage')
      .exists().withMessage('Le paramètre numpage est requis.')
      .isInt({ min: 1 }).withMessage('Le paramètre numpage doit être un entier positif.'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { numpage } = req.params;
      const page = parseInt(numpage, 10) || 1;
      const limit = 50; // Nombre de résultats par page
      const offset = (page - 1) * limit;

      // Récupérer la session actuelle ou la plus récente
      const today = new Date();
      let session = await SessionModel.findOne({
        where: {
          date_debut: { [Op.lte]: today },
          date_fin: { [Op.gte]: today },
        },
      });

      if (!session) {
        // Si aucune session active, récupérer la plus récente
        session = await SessionModel.findOne({
          order: [['date_fin', 'DESC']],
        });

        if (!session) {
          res.status(404).send('Aucune session disponible.');
          return;
        }
      }

      // Récupérer les jeux vendus lors de la session
      const jeuxVendus = await Jeu.findAll({
        where: {
          statut: 'vendu',
          updatedAt: {
            [Op.between]: [session.date_debut, session.date_fin],
          },
        },
        include: [
          {
            model: Licence,
            as: 'licence',
            attributes: [],
            include: [
              {
                model: Editeur,
                as: 'editeur',
                attributes: [],
              },
            ],
          },
        ],
        attributes: [
          [Sequelize.col('licence->editeur.nom'), 'editeur_nom'],
          [Sequelize.col('licence.nom'), 'licence_nom'],
          [Sequelize.fn('COUNT', Sequelize.col('Jeu.id')), 'quantite_vendue'],
        ],
        group: [
          Sequelize.col('licence->editeur.nom'),
          Sequelize.col('licence.nom'),
        ],
        order: [
          [Sequelize.col('editeur_nom'), 'ASC'],
          [Sequelize.col('licence_nom'), 'ASC'],
        ],
        limit,
        offset,
        raw: true,
      });

      res.status(200).json(jeuxVendus);
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux vendus :', error);
      res.status(500).send('Erreur lors de la récupération des jeux vendus.');
    }
  }
);

// Route GET /gestion/vendeurs/:numpage avec validation et middlewares
router.get(
  '/vendeurs/:numpage',
  authenticateToken,,
  [
    param('numpage')
      .exists().withMessage('Le paramètre numpage est requis.')
      .isInt({ min: 1 }).withMessage('Le paramètre numpage doit être un entier positif.'),
    query('vendeur_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Le paramètre vendeur_id doit être un entier positif.'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { numpage } = req.params;
      const { vendeur_id } = req.query; // Vendeur ID passé en paramètre optionnel
      const page = parseInt(numpage, 10) || 1;
      const limit = 50; // Nombre de résultats par page
      const offset = (page - 1) * limit;

      // Récupérer la session actuelle ou la plus récente
      const today = new Date();
      let session = await SessionModel.findOne({
        where: {
          date_debut: { [Op.lte]: today },
          date_fin: { [Op.gte]: today },
        },
      });

      if (!session) {
        // Si aucune session active, récupérer la plus récente
        session = await SessionModel.findOne({
          order: [['date_fin', 'DESC']],
        });

        if (!session) {
          res.status(404).send('Aucune session disponible.');
          return;
        }
      }

      // Construire la clause WHERE
      const whereClause: any = {
        statut: 'vendu',
        updatedAt: {
          [Op.between]: [session.date_debut, session.date_fin],
        },
      };

      if (vendeur_id) {
        whereClause['$depot.vendeur_id$'] = parseInt(vendeur_id as string, 10);
      }

      // Récupérer les jeux vendus lors de la session, groupés par vendeur, éditeur et licence
      const jeuxVendus = await Jeu.findAll({
        where: whereClause,
        include: [
          {
            model: Depot,
            as: 'depot',
            attributes: [],
            include: [
              {
                model: Vendeur,
                as: 'vendeur',
                attributes: [],
                include: [
                  {
                    model: Utilisateur,
                    as: 'utilisateur',
                    attributes: [],
                  },
                ],
              },
            ],
          },
          {
            model: Licence,
            as: 'licence',
            attributes: [],
            include: [
              {
                model: Editeur,
                as: 'editeur',
                attributes: [],
              },
            ],
          },
        ],
        attributes: [
          [Sequelize.col('depot->vendeur->utilisateur.nom'), 'vendeur_nom'],
          [Sequelize.col('licence->editeur.nom'), 'editeur_nom'],
          [Sequelize.col('licence.nom'), 'licence_nom'],
          [Sequelize.fn('COUNT', Sequelize.col('Jeu.id')), 'quantite_vendue'],
        ],
        group: [
          Sequelize.col('depot->vendeur->utilisateur.nom'),
          Sequelize.col('licence->editeur.nom'),
          Sequelize.col('licence.nom'),
        ],
        order: [
          [Sequelize.col('vendeur_nom'), 'ASC'],
          [Sequelize.col('editeur_nom'), 'ASC'],
          [Sequelize.col('licence_nom'), 'ASC'],
        ],
        limit,
        offset,
        raw: true,
      });

      res.status(200).json(jeuxVendus);
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux vendus :', error);
      res.status(500).send('Erreur lors de la récupération des jeux vendus.');
    }
  }
);

// Nouvelle route GET /gestion/bilan avec validation et middlewares
router.get('/bilan', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Récupérer la session actuelle ou la plus récente
      const today = new Date();
      let session = await SessionModel.findOne({
        where: {
          date_debut: { [Op.lte]: today },
          date_fin: { [Op.gte]: today },
        },
      });

      if (!session) {
        // Si aucune session active, récupérer la plus récente
        session = await SessionModel.findOne({
          order: [['date_fin', 'DESC']],
        });

        if (!session) {
          res.status(404).send('Aucune session disponible.');
          return;
        }
      }

      // Récupérer les sommes pour tous les vendeurs pour la session
      const sommes = await Somme.findAll({
        where: {
          sessionId: session.id,
        },
      });

      if (sommes.length === 0) {
        res.status(404).send('Aucune donnée financière pour cette session.');
        return;
      }

      // Calculer les montants totaux
      let totalGeneréParVendeurs = 0;
      let totalDûAuxVendeurs = 0;

      sommes.forEach((somme) => {
        totalGeneréParVendeurs += parseFloat(somme.sommegenerée.toString());
        totalDûAuxVendeurs += parseFloat(somme.sommedue.toString());
      });

      const argentGénéréPourAdmin = totalGeneréParVendeurs - totalDûAuxVendeurs;

      res.status(200).json({
        session: {
          id: session.id,
          date_debut: session.date_debut,
          date_fin: session.date_fin,
        },
        bilan: {
          total_generé_par_vendeurs: totalGeneréParVendeurs.toFixed(2),
          total_dû_aux_vendeurs: totalDûAuxVendeurs.toFixed(2),
          argent_généré_pour_admin: argentGénéréPourAdmin.toFixed(2),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération du bilan financier.');
    }
  }
);

// Route GET pour récupérer le bilan d'un vendeur spécifique
router.get('/bilan/:idvendeur', authenticateToken,
  [
    param('idvendeur')
      .exists().withMessage('Le paramètre idvendeur est requis.')
      .isInt({ min: 1 }).withMessage('Le paramètre idvendeur doit être un entier positif.'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const idVendeur = parseInt(req.params.idvendeur, 10);

      // Vérifier l'existence du vendeur et inclure l'utilisateur
      const vendeur = await Vendeur.findByPk(idVendeur, {
        include: [{ model: Utilisateur, as: 'utilisateur' }],
      });
      if (!vendeur) {
        res.status(404).send('Vendeur introuvable.');
        return;
      }

      // Récupérer la session actuelle ou la plus récente
      const today = new Date();
      let session = await SessionModel.findOne({
        where: {
          date_debut: { [Op.lte]: today },
          date_fin: { [Op.gte]: today },
        },
      });

      if (!session) {
        // Si aucune session active, récupérer la plus récente
        session = await SessionModel.findOne({
          order: [['date_fin', 'DESC']],
        });

        if (!session) {
          res.status(404).send('Aucune session disponible.');
          return;
        }
      }

      // Récupérer les sommes pour le vendeur et la session
      const somme = await Somme.findOne({
        where: {
          utilisateurId: vendeur.id, // Utiliser l'ID du vendeur
          sessionId: session.id,
        },
      });

      if (!somme) {
        res.status(404).send('Aucune donnée financière pour ce vendeur dans la session actuelle.');
        return;
      }

      // Calculer les taxes et l'argent généré pour l'administrateur
      const totalGeneréParVendeur = parseFloat(somme.sommegenerée.toString());
      const totalDûAuVendeur = parseFloat(somme.sommedue.toString());
      const argentGénéréPourAdmin = totalGeneréParVendeur - totalDûAuVendeur; // Commission prise par l'admin

      res.status(200).json({
        vendeur: {
          id: vendeur.id,
          nom: vendeur.utilisateur?.nom,
          email: vendeur.utilisateur?.email,
        },
        session: {
          id: session.id,
          date_debut: session.date_debut,
          date_fin: session.date_fin,
        },
        bilan: {
          total_generé_par_vendeur: totalGeneréParVendeur.toFixed(2),
          total_dû_au_vendeur: totalDûAuVendeur.toFixed(2),
          argent_généré_pour_admin: argentGénéréPourAdmin.toFixed(2),
        },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du bilan financier :', error);
      res.status(500).send('Erreur lors de la récupération du bilan financier.');
    }
  }
);

export default router;