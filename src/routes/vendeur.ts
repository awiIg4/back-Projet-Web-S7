import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from '../models/utilisateur';
import Vendeur from '../models/vendeur';
import Jeu from '../models/jeu';
import Depot from '../models/depot'
import Somme from '../models/somme';
import Licence from '../models/licence'
import Session from '../models/session';
import { isAdminOrManager} from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Étendre l'interface Request pour inclure 'user'
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    typeUtilisateur: string;
  };
}

// Route pour créer un vendeur avec un email unique
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
        type_utilisateur: 'vendeur',
      });
  
      // Créer l'entrée associée dans la table Vendeur
      await Vendeur.create({
        id: nouvelUtilisateur.id,
      });
  
      res.status(201).send('Compte vendeur créé avec succès.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la création du compte vendeur.');
    }
  });  

// Route pour charger un vendeur grâce à son email
router.get('/:email', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;

  try {
    const utilisateur = await Utilisateur.findOne({
      where: { email, type_utilisateur: 'vendeur' },
      include: [{ model: Vendeur, as: 'vendeur' }],
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
});

// Route pour récupérer les informations d'un vendeur (nom, email, téléphone, adresse)
router.get('/informations/:id', isAdminOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const utilisateur = await Utilisateur.findByPk(id, {
      attributes: ['id', 'nom', 'email', 'telephone', 'adresse'],
      include: [{ model: Vendeur, as: 'vendeur' }],
    });

    if (!utilisateur) {
      res.status(404).send('Vendeur non trouvé.');
      return;
    }

    res.status(200).json(utilisateur);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des informations du vendeur.');
  }
});

// Route pour récupérer les jeux vendus et en vente pour une session
router.get(
  '/stock/:idsession',
  isAdminOrManager,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { idsession } = req.params;
    const { numpage = 1 } = req.query;

    try {
      const jeux = await Jeu.findAll({
        where: {
          statut: {
            [Op.in]: ['en vente', 'vendu'],
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
            ],
          },
        ],
        limit: 10,
        offset: (Number(numpage) - 1) * 10,
      });

      res.status(200).json(jeux);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des jeux pour la session.');
    }
  }
);

// Route pour récupérer la somme due au vendeur pour une session
router.get('/sommedue/:idsession', isAdminOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { idsession } = req.params;
  const { idvendeur } = req.query;

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
});

// Route pour récupérer l'argent généré par les ventes pour une session
router.get('/argentgagne/:idsession', isAdminOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { idsession } = req.params;
  const { idvendeur } = req.query;

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
      return;
    }

    res.status(200).json({ sommegenerée: somme.sommegenerée });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de l\'argent généré.');
  }
});

// Route pour récupérer les statistiques des jeux vendus par licence
router.get('/stats', isAdminOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await Jeu.findAll({
        where: {
          statut: 'vendu',
        },
        attributes: [
          'licenceId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'quantiteVendu'],
        ],
        include: [
          {
            model: Licence,
            as: 'licence',
            attributes: ['nom'],
          },
        ],
        group: ['licenceId', 'licence.nom'],
      });
  
      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des statistiques des jeux vendus.');
    }
  });

export default router;