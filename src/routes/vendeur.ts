import express, { Response, Request } from 'express';
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
import { body, param, query, validationResult } from 'express-validator'; // Import ajouté
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';
import { isAdminOrManager } from '../middleware/authorization';

config(); // Charger les variables d'environnement

const router = express.Router();

// Middlewares de validation
const validateVendeurRegister = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('L\'email est invalide'),
  body('telephone')
    .matches(/^\d{10}$/)
    .withMessage('Le numéro de téléphone doit contenir exactement 10 chiffres'),
  body('adresse').notEmpty().withMessage('L\'adresse est requise'),
];

const validateEmailParam = [
  param('email').isEmail().withMessage('L\'email est invalide'),
];

const validateIdSessionVendeurParams = [
  param('idsession')
    .isInt({ gt: 0 })
    .withMessage('idsession doit être un entier positif'),
  param('idvendeur')
    .isInt({ gt: 0 })
    .withMessage('idvendeur doit être un entier positif'),
  query('numpage')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('numpage doit être un entier positif'),
];

const validateSommeParams = [
  param('idsession')
    .isInt({ gt: 0 })
    .withMessage('idsession doit être un entier positif'),
  query('idvendeur')
    .isInt({ gt: 0 })
    .withMessage('idvendeur doit être un entier positif'),
];

const validateStatsParam = [
  param('idvendeur')
    .isInt({ gt: 0 })
    .withMessage('idvendeur doit être un entier positif'),
];

// Route pour créer un vendeur avec un email unique
router.post('/register', authenticateToken, isAdminOrManager, validateVendeurRegister, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

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
  }
);

// Route pour charger un vendeur grâce à son email 
router.get('/:email', authenticateToken, isAdminOrManager, validateEmailParam, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.params;

    try {
      const utilisateur = await Utilisateur.findOne({
        where: { email, type_utilisateur: 'vendeur' },
      });

      if (!utilisateur) {
        res.status(404).send('Vendeur non trouvé.');
        return;
      }

      res.status(200).json(utilisateur);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors du chargement du vendeur.');
    }
  }
);

// Route pour récupérer les informations d'un vendeur 
router.get('/informations/:id', authenticateToken, isAdminOrManager, [ param('id').isInt({ gt: 0 }).withMessage('id doit être un entier positif'), ], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const utilisateur = await Utilisateur.findByPk(id, {
        attributes: ['id', 'nom', 'email', 'telephone', 'adresse', 'type_utilisateur'],
      });

      if (!utilisateur || utilisateur.type_utilisateur !== 'vendeur') {
        res.status(404).send('Vendeur non trouvé.');
        return;
      }

      res.status(200).json(utilisateur);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des informations du vendeur.');
    }
  }
);

// Route pour récupérer les jeux pour une session et un vendeur
router.get('/stock/:idsession/:idvendeur', authenticateToken, isAdminOrManager, validateIdSessionVendeurParams, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);
    const numpage = Number(req.query.numpage) || 1;

    try {
      // Vérifier que le vendeur existe
      const vendeur = await Vendeur.findByPk(idvendeur);
      if (!vendeur) {
        res.status(404).send('Vendeur non trouvé.');
        return;
      }

      const jeux = await Jeu.findAll({
        where: {
          statut: {
            [Op.in]: ['en vente', 'vendu', 'récuperable', 'récupéré'],
          },
        },
        include: [
          {
            model: Depot,
            as: 'depot',
            required: true,
            include: [
              {
                model: Session,
                as: 'session',
                required: true,
                where: {
                  id: idsession,
                },
              },
              {
                model: Vendeur,
                as: 'vendeur',
                where: {
                  id: idvendeur,
                },
              },
            ],
          },
        ],
        limit: 10,
        offset: (numpage - 1) * 10,
      });

      res.status(200).json(jeux);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des jeux pour la session.');
    }
  }
);

// Route pour récupérer les jeux pour une session, un vendeur et un statut donné
router.get('/stock/:idsession/:idvendeur/:statut',
  authenticateToken,
  isAdminOrManager,
  [
    param('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    param('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
    param('statut')
      .isString()
      .custom((value) => {
        const statutsValides = ['en vente', 'vendu', 'récuperable', 'récupéré'];
        if (!statutsValides.includes(value.toLowerCase())) {
          throw new Error('Statut invalide.');
        }
        return true;
      }),
  ],
  validateIdSessionVendeurParams,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);
    const statut = req.params.statut.toLowerCase();
    const numpage = Number(req.query.numpage) || 1;

    try {
      // Vérifier que le vendeur existe
      const vendeur = await Vendeur.findByPk(idvendeur);
      if (!vendeur) {
        res.status(404).send('Vendeur non trouvé.');
        return;
      }

      // Rechercher les jeux avec le statut donné
      const jeux = await Jeu.findAll({
        where: {
          statut: statut,
        },
        include: [
          {
            model: Depot,
            as: 'depot',
            required: true,
            include: [
              {
                model: Session,
                as: 'session',
                required: true,
                where: {
                  id: idsession,
                },
              },
              {
                model: Vendeur,
                as: 'vendeur',
                where: {
                  id: idvendeur,
                },
              },
            ],
          },
        ],
        limit: 10,
        offset: (numpage - 1) * 10,
      });

      res.status(200).json(jeux);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des jeux pour la session et le statut.');
    }
  }
);


// Route pour récupérer la somme due au vendeur pour une session
router.get('/sommedue/:idsession/:idvendeur', authenticateToken, isAdminOrManager,
  [
    param('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    param('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);

    try {
      const somme = await Somme.findOne({
        where: {
          utilisateurId: idvendeur,
          sessionId: idsession,
        },
        attributes: ['sommedue'],
      });

      if (!somme) {
        res.status(404).send('Aucune somme due trouvée pour cette session.');
        return;
      }

      res.status(200).json({ sommedue: somme.sommedue });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération de la somme due.');
    }
  }
);

// Route pour mettre à jour la somme due à zéro pour une session et un vendeur
router.put('/sommedue/:idsession/:idvendeur', authenticateToken, isAdminOrManager,
  [
    param('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    param('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);

    try {
      // Rechercher la somme due
      const somme = await Somme.findOne({
        where: {
          utilisateurId: idvendeur,
          sessionId: idsession,
        },
      });

      if (!somme) {
        res.status(404).send('Aucune somme due trouvée pour cette session.');
        return;
      }

      // Mettre à jour la somme due à zéro
      somme.sommedue = 0;
      await somme.save();

      res.status(200).json({ message: 'Somme due mise à jour à zéro.' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la mise à jour de la somme due.');
    }
  }
);


// Route pour récupérer l'argent généré par les ventes pour une session avec validation
router.get('/argentgagne/:idsession/:idvendeur', authenticateToken, isAdminOrManager,
  [
    param('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    param('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);

    try {
      const somme = await Somme.findOne({
        where: {
          utilisateurId: idvendeur,
          sessionId: idsession,
        },
        attributes: ['sommegenerée'],
      });

      if (!somme) {
        res.status(404).send('Aucune somme générée trouvée pour cette session.');
      } else {
        res.status(200).json({ sommegenerée: somme.sommegenerée });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la récupération de l'argent généré.");
    }
  }
);

// Middleware de validation pour les statistiques
const validateStatsParams = [
  param('idvendeur')
    .isInt()
    .withMessage('L\'ID du vendeur doit être un entier.'),
];

router.get(
  '/stats/:idvendeur',
  authenticateToken,
  isAdminOrManager,
  validateStatsParams,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const idvendeur = Number(req.params.idvendeur);

    try {
      // Vérifier que le vendeur existe
      const vendeur = await Vendeur.findByPk(idvendeur);
      if (!vendeur) {
        res.status(404).send('Vendeur non trouvé.');
        return;
      }

      const stats = await Jeu.findAll({
        where: {
          statut: 'vendu',
        },
        attributes: [
          'licence_id',
          [fn('COUNT', col('Jeu.id')), 'quantiteVendu'],
        ],
        include: [
          {
            model: Licence,
            as: 'licence',
            attributes: ['nom'],
          },
          {
            model: Depot,
            as: 'depot',
            required: true,
            where: {
              vendeur_id: idvendeur,
            },
            attributes: [],
          },
        ],
        group: ['licence_id', 'licence.nom'],
        raw: true,
      });


      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des statistiques des jeux vendus.');
    }
  }
);

export default router;