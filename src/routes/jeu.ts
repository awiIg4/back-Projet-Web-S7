import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op, fn, where, col, Sequelize } from 'sequelize';
import Jeu, { JeuCreationAttributes } from '../models/jeu';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import Vendeur from '../models/vendeur';
import Depot from '../models/depot';
import SessionModel from '../models/session';
import CodePromo from '../models/codePromotion';
import Acheteur from '../models/acheteur';
import Somme, { SommeCreationAttributes } from '../models/somme';
import Achat, { AchatCreationAttributes } from '../models/achat';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateToken';
import { isAdminOrManager } from '../middleware/authorization';
import { body, query, param, validationResult } from 'express-validator';

config(); // Charger les variables d'environnement

const router = express.Router();

// Fonction pour supprimer les accents d'une chaîne de caractères
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Middleware de gestion des erreurs de validation
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

router.get('/rechercher',
  [
    query('numpage')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Le paramètre numpage doit être un entier positif.'),
    query('licence')
      .optional()
      .isString()
      .withMessage('Le paramètre licence doit être une chaîne de caractères.'),
    query('editeur')
      .optional()
      .isString()
      .withMessage('Le paramètre editeur doit être une chaîne de caractères.'),
    query('price_min')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Le paramètre price_min doit être un nombre positif.'),
    query('price_max')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Le paramètre price_max doit être un nombre positif.'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Extraction et parsing des paramètres
      const numpage = parseInt((req.query.numpage as string) || '1', 10);
      const licence = req.query.licence ? removeAccents((req.query.licence as string).toLowerCase()) : null;
      const editeur = req.query.editeur ? removeAccents((req.query.editeur as string).toLowerCase()) : null;
      const price_min = req.query.price_min ? parseFloat(req.query.price_min as string) : null;
      const price_max = req.query.price_max ? parseFloat(req.query.price_max as string) : null;
  
      const limit = 50;
      const offset = (numpage - 1) * limit;
  
      // Récupérer **tous** les jeux en vente sans filtre SQL
      const jeux = await Jeu.findAll({
        where: { statut: 'en vente' },
        include: [
          {
            model: Licence,
            as: 'licence',
            include: [{ model: Editeur, as: 'editeur' }],
          },
        ],
      });

      console.log(jeux);
  
      // Appliquer les filtres **manuellement**
      let filteredJeux = jeux;
  
      if (licence) {
        filteredJeux = filteredJeux.filter(jeu =>
          jeu.licence && removeAccents(jeu.licence.nom.toLowerCase()).includes(licence)
        );
      }
  
      if (editeur) {
        filteredJeux = filteredJeux.filter(jeu =>
          jeu.licence?.editeur && removeAccents(jeu.licence.editeur.nom.toLowerCase()).includes(editeur)
        );
      }
  
      if (price_min !== null) {
        filteredJeux = filteredJeux.filter(jeu => parseFloat(jeu.prix.toString()) >= price_min);
      }
  
      if (price_max !== null) {
        filteredJeux = filteredJeux.filter(jeu => parseFloat(jeu.prix.toString()) <= price_max);
      }
  
      // Regroupement par licence
      const groupedJeux: any = {};
      filteredJeux.forEach(jeu => {
        const licenceId = jeu.licence?.id;
        if (!licenceId) return;
  
        if (!groupedJeux[licenceId]) {
          groupedJeux[licenceId] = {
            quantite: 0,
            prix_min: parseFloat(jeu.prix.toString()),
            prix_max: parseFloat(jeu.prix.toString()),
            licence_nom: jeu.licence?.nom,
            editeur_nom: jeu.licence?.editeur?.nom || 'Éditeur inconnu',
          };
        }
  
        groupedJeux[licenceId].quantite++;
        groupedJeux[licenceId].prix_min = Math.min(groupedJeux[licenceId].prix_min, parseFloat(jeu.prix.toString()));
        groupedJeux[licenceId].prix_max = Math.max(groupedJeux[licenceId].prix_max, parseFloat(jeu.prix.toString()));
      });
  
      // Conversion en tableau et pagination
      const result = Object.values(groupedJeux).slice(offset, offset + limit);
  
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la recherche des jeux:', error);
      res.status(500).send('Erreur lors de la recherche des jeux.');
    }
  }
);

// Route pour les jeux à récupérer par un vendeur pour une session
router.get('/a_recuperer', authenticateToken, isAdminOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const jeux = await Jeu.findAll({
      where: {
        statut: 'récuperable',
      },
      include: [
        {
          model: Depot,
          as: 'depot',
          include: [
            {
              model: Vendeur,
              as: 'vendeur',
            },
            {
              model: SessionModel,
              as: 'session',
            },
          ],
        },
      ],
    });

    res.status(200).json(jeux);
  } catch (error) {
    console.error('Erreur lors de la recherche des jeux à récupérer:', error);
    res.status(500).send('Erreur lors de la recherche des jeux à récupérer.');
  }
});

// Route pour trouver les jeux à mettre en rayon
router.get('/pas_en_rayon', authenticateToken, isAdminOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const jeux = await Jeu.findAll({
      where: {
        statut: 'récuperable',
      },
      include: [
        {
          model: Depot,
          as: 'depot',
          include: [
            {
              model: Vendeur,
              as: 'vendeur',
            },
          ],
        },
      ],
    });

    res.status(200).json(jeux);
  } catch (error) {
    console.error('Erreur lors de la recherche des jeux à mettre en rayon:', error);
    res.status(500).send('Erreur lors de la recherche des jeux à mettre en rayon.');
  }
});


// Route pour déposer des jeux pour un vendeur 
router.post('/deposer', authenticateToken, isAdminOrManager,
  [
    body('licence')
      .exists().withMessage('Le champ licence est requis.')
      .isArray({ min: 1 }).withMessage('Le champ licence doit être un tableau non vide.')
      .custom((licence: any[]) => licence.every(id => Number.isInteger(id) && id > 0))
      .withMessage('Chaque licence doit être un entier positif.'),
    body('quantite')
      .exists().withMessage('Le champ quantite est requis.')
      .isArray({ min: 1 }).withMessage('Le champ quantite doit être un tableau non vide.')
      .custom((quantite: any[]) => quantite.every(q => Number.isInteger(q) && q > 0))
      .withMessage('Chaque quantite doit être un entier positif.'),
    body('prix')
      .exists().withMessage('Le champ prix est requis.')
      .isArray({ min: 1 }).withMessage('Le champ prix doit être un tableau non vide.')
      .custom((prix: any[]) => prix.every(p => typeof p === 'number' && p >= 0))
      .withMessage('Chaque prix doit être un nombre positif ou nul.'),
    body('code_promo')
      .optional({ nullable: true })
      .isString().withMessage('Le champ code_promo doit être une chaîne de caractères.'),
    body('id_vendeur')
      .exists().withMessage('Le champ id_vendeur est requis.')
      .isInt({ min: 1 }).withMessage('Le champ id_vendeur doit être un entier positif.'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { licence, quantite, prix, code_promo, id_vendeur } = req.body;

    try {
      // Vérifier l'existence du vendeur
      const vendeur = await Vendeur.findByPk(id_vendeur);
      if (!vendeur) {
        res.status(404).send('Vendeur introuvable.');
        return;
      }

      // Vérifier le code promo (si fourni)
      let promo: CodePromo | null = null;
      let reductionPourcent = 0;
      if (code_promo) {
        promo = await CodePromo.findOne({ where: { libelle: code_promo } });
        if (promo) {
          reductionPourcent = promo.reductionPourcent;
        } else {
          res.status(404).send('Code promo invalide.');
          return;
        }
      }

      // Récupérer la session active
      const today = new Date();
      const session = await SessionModel.findOne({
        where: {
          date_debut: { [Op.lte]: today },
          date_fin: { [Op.gte]: today },
        },
      });

      if (!session) {
        res.status(404).send('Aucune session active trouvée.');
        return;
      }

      // Calculer la somme des prix des jeux à déposer et la quantité totale
      const totalPrixJeux = prix.reduce((acc: number, val: number, index: number) => acc + val * quantite[index], 0);
      const totalQuantite = quantite.reduce((acc: number, val: number) => acc + val, 0);

      // Calculer les frais de dépôt en fonction des paramètres de la session
      let fraisDepot = 0;
      if (session.frais_depot_en_pourcentage) {
        fraisDepot = (totalPrixJeux * session.valeur_frais_depot) / 100;
      } else {
        fraisDepot = totalQuantite * session.valeur_frais_depot;
      }

      // Appliquer la réduction si un code promo valide est fourni
      if (reductionPourcent > 0) {
        fraisDepot = fraisDepot - (fraisDepot * reductionPourcent) / 100;
      }

      // Créer un dépôt pour ce vendeur et cette session
      const depot = await Depot.create({
        vendeur_id: id_vendeur,
        session_id: session.id,
        date_depot: today,
        frais_depot: fraisDepot,
      });

      // Parcourir les licences et créer les jeux
      const jeuxPromises = licence.map(async (licenceId: number, index: number) => {
        const currentLicence = await Licence.findByPk(licenceId);

        if (!currentLicence) {
          throw new Error(`Licence avec l'ID ${licenceId} introuvable.`);
        }

        // Créer les jeux en fonction de la quantité pour chaque licence
        for (let i = 0; i < quantite[index]; i++) {
          await Jeu.create({
            licence_id: licenceId, // Correction : utiliser licence_id au lieu de id
            prix: prix[index],
            statut: 'récuperable',
            depot_id: depot.id, // Associer directement le jeu au dépôt
          } as JeuCreationAttributes); // Assurez-vous d'importer JeuCreationAttributes
        }
      });

      await Promise.all(jeuxPromises);

      res.status(201).json({
        message: 'Dépôt effectué avec succès et jeux créés.',
        fraisDepot: fraisDepot.toFixed(2),
      });
    } catch (error: any) {
      console.error(error);
      if (error.message.startsWith('Licence avec l\'ID')) {
        res.status(404).send(error.message);
      } else {
        res.status(500).send('Erreur lors du dépôt des jeux.');
      }
    }
  }
);

// Route pour mettre à jour le status d'un ou plusieurs jeux
router.put('/updateStatus', authenticateToken, isAdminOrManager,
  [
    body('jeux_ids')
      .exists().withMessage('Le champ jeux_ids est requis.')
      .isArray({ min: 1 }).withMessage('Le champ jeux_ids doit être un tableau non vide.')
      .custom((jeux_ids: any[]) => jeux_ids.every(id => Number.isInteger(id) && id > 0))
      .withMessage('Chaque jeu_id doit être un entier positif.'),
    body('nouveau_statut')
      .exists().withMessage('Le champ nouveau_statut est requis.')
      .isIn(['en vente', 'récuperable', 'vendu', 'récupéré'])
      .withMessage('Le champ nouveau_statut doit être une valeur valide.'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { jeux_ids, nouveau_statut } = req.body;

    try {
      // Récupérer les jeux correspondants
      const jeux = await Jeu.findAll({
        where: {
          id: jeux_ids,
        },
      });

      // Vérifier si tous les jeux à mettre à jour ont été trouvés
      const jeuxIdsTrouves = jeux.map((jeu) => jeu.id);
      const jeuxNonTrouves = jeux_ids.filter((id: number) => !jeuxIdsTrouves.includes(id));

      if (jeuxNonTrouves.length > 0) {
        res.status(400).send(`Certains jeux ne peuvent pas être trouvés ou n'existent pas : ${jeuxNonTrouves.join(', ')}`);
        return;
      }

      // Mettre à jour le statut de chaque jeu
      await Promise.all(
        jeux.map((jeu) => {
          jeu.statut = nouveau_statut;
          return jeu.save();
        })
      );

      res.status(200).json({
        message: 'Le statut des jeux a été mis à jour avec succès.',
        jeux_ids: jeuxIdsTrouves,
        nouveau_statut,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la mise à jour du statut des jeux.');
    }
  }
);

// Route pour qu'un vendeur récupère ses jeux
router.post('/recuperer', authenticateToken, isAdminOrManager,
  [
    body('jeux_a_recup')
      .exists().withMessage('Le champ jeux_a_recup est requis.')
      .isArray({ min: 1 }).withMessage('Le champ jeux_a_recup doit être un tableau non vide.')
      .custom((jeux_a_recup: any[]) => jeux_a_recup.every(id => Number.isInteger(id) && id > 0))
      .withMessage('Chaque jeu_id dans jeux_a_recup doit être un entier positif.'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { jeux_a_recup } = req.body;

    try {
      // Récupérer les jeux correspondants et vérifier leur statut
      const jeux = await Jeu.findAll({
        where: {
          id: jeux_a_recup,
          statut: ['en vente', 'récuperable'],
        },
      });

      // Vérifier si tous les jeux à récupérer ont été trouvés
      const jeuxIdsTrouves = jeux.map((jeu) => jeu.id);
      const jeuxNonTrouves = jeux_a_recup.filter((id: number) => !jeuxIdsTrouves.includes(id));

      if (jeuxNonTrouves.length > 0) {
        res.status(400).send(`Certains jeux ne peuvent pas être récupérés ou n'existent pas : ${jeuxNonTrouves.join(', ')}`);
        return;
      }

      // Mettre à jour le statut des jeux récupérables
      await Promise.all(
        jeux.map((jeu) => {
          jeu.statut = 'récupéré';
          return jeu.save();
        })
      );

      res.status(200).json({
        message: 'Les jeux ont été récupérés avec succès.',
        jeux_recuperes: jeux,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des jeux.');
    }
  }
);

// Route pour que quelqu'un achète un jeu
router.post('/acheter', authenticateToken, isAdminOrManager,
  [
    body('jeux_a_acheter')
      .exists().withMessage('Le champ jeux_a_acheter est requis.')
      .isArray({ min: 1 }).withMessage('Le champ jeux_a_acheter doit être un tableau non vide.')
      .custom((jeux_a_acheter: any[]) => jeux_a_acheter.every(id => Number.isInteger(id) && id > 0))
      .withMessage('Chaque jeu_id dans jeux_a_acheter doit être un entier positif.'),
    body('code_promo')
      .optional( { nullable: true })
      .isString().withMessage('Le champ code_promo doit être une chaîne de caractères.'),
    body('acheteur')
      .optional( { nullable: true })
      .isInt({ min: 1 }).withMessage('Le champ acheteur doit être un entier positif.'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { jeux_a_acheter, code_promo, acheteur } = req.body;

    console.log('--- Début de la route /acheter ---');
    console.log('Utilisateur authentifié :', req.user);
    console.log('Corps de la requête :', req.body);

    try {
      // Vérifier le code promo (si fourni)
      let promo: CodePromo | null = null;
      let reductionPourcent = 0;
      if (code_promo) {
        console.log('Code promo fourni :', code_promo);
        promo = await CodePromo.findOne({ where: { libelle: code_promo } });
        console.log('Code promo trouvé :', promo);
        if (!promo) {
          console.log('Code promo invalide.');
          res.status(400).send('Code promo invalide.');
          return;
        }
        reductionPourcent = promo.reductionPourcent;
        console.log('Réduction pourcentage :', reductionPourcent);
      }

      // Vérifier l'existence de l'acheteur (si fourni)
      if (acheteur) {
        console.log('Acheteur fourni :', acheteur);
        const acheteurExist = await Acheteur.findByPk(acheteur);
        console.log('Acheteur trouvé :', acheteurExist);
        if (!acheteurExist) {
          console.log('Acheteur non trouvé.');
          res.status(404).send('Acheteur non trouvé.');
          return;
        }
      }

      // Récupérer les jeux correspondants et vérifier leur statut
      console.log('Jeux à acheter :', jeux_a_acheter);
      const jeux = await Jeu.findAll({
        where: {
          id: jeux_a_acheter,
          statut: 'en vente',
        },
        include: [
          {
            model: Depot,
            as: 'depot',
            include: [
              {
                model: Vendeur,
                as: 'vendeur',
              },
            ],
          },
        ],
      });
      console.log('Jeux trouvés :', jeux);

      // Vérifier si tous les jeux à acheter ont été trouvés et sont en vente
      const jeuxIdsTrouves = jeux.map((jeu) => jeu.id);
      console.log('IDs des jeux trouvés :', jeuxIdsTrouves);
      const jeuxNonTrouves = jeux_a_acheter.filter((id: number) => !jeuxIdsTrouves.includes(id));
      console.log('Jeux non trouvés ou non en vente :', jeuxNonTrouves);

      if (jeuxNonTrouves.length > 0) {
        console.log('Certains jeux ne peuvent pas être achetés ou n\'existent pas.');
        res.status(400).send(`Certains jeux ne peuvent pas être achetés ou n'existent pas : ${jeuxNonTrouves.join(', ')}`);
        return;
      }

      // Récupérer la session active pour calculer la commission
      const today = new Date();
      console.log('Date du jour :', today);
      const session = await SessionModel.findOne({
        where: {
          date_debut: { [Op.lte]: today },
          date_fin: { [Op.gte]: today },
        },
      });
      console.log('Session active trouvée :', session);

      if (!session) {
        console.log('Aucune session active trouvée.');
        res.status(404).send('Aucune session active trouvée.');
        return;
      }

      // Préparer un mapping pour accumuler les sommes par vendeur
      const sommeParVendeur: { [vendeurId: number]: { sommedue: number; sommegenerée: number } } = {};

      // Calculer la commission sur chaque jeu
      const achatsPromises = jeux.map(async (jeu) => {
        console.log('Traitement du jeu ID :', jeu.id);
        console.log('Détails du jeu :', jeu.toJSON());

        // Calculer le prix après réduction, si applicable
        const prixApresReduction = promo
          ? jeu.prix - (jeu.prix * reductionPourcent) / 100
          : jeu.prix;
        console.log(`Prix après réduction pour le jeu ${jeu.id} :`, prixApresReduction);

        // Calculer la commission
        const commission = session.commission_en_pourcentage
          ? (prixApresReduction * session.valeur_commission) / 100
          : session.valeur_commission;
        console.log(`Commission pour le jeu ${jeu.id} :`, commission);

        // Montant dû au vendeur
        const montantDuVendeur = prixApresReduction - commission;
        console.log(`Montant dû au vendeur pour le jeu ${jeu.id} :`, montantDuVendeur);

        // Créer l'achat dans la base de données
        const nouvelAchat = await Achat.create({
          jeu_id: jeu.id,
          acheteur_id: acheteur || null,
          date_transaction: today,
          commission: commission,
        } as AchatCreationAttributes);
        console.log(`Achat créé pour le jeu ${jeu.id} :`, nouvelAchat.toJSON());

        // Mettre à jour le statut du jeu à 'vendu'
        jeu.statut = 'vendu';
        await jeu.save();
        console.log(`Statut du jeu ${jeu.id} mis à jour à 'vendu'.`);

        // Récupérer le vendeur via le dépôt
        const vendeur = jeu.depot?.vendeur;
        console.log(`Vendeur pour le jeu ${jeu.id} :`, vendeur?.toJSON());
        if (!vendeur) {
          throw new Error(`Le vendeur pour le jeu ${jeu.id} n'existe pas.`);
        }

        const vendeurId = vendeur.id;
        console.log(`ID du vendeur pour le jeu ${jeu.id} :`, vendeurId);

        // Accumuler les sommes pour chaque vendeur
        if (!sommeParVendeur[vendeurId]) {
          sommeParVendeur[vendeurId] = {
            sommedue: 0,
            sommegenerée: 0,
          };
        }

        sommeParVendeur[vendeurId].sommedue = Number(sommeParVendeur[vendeurId].sommedue) + Number(montantDuVendeur);
        sommeParVendeur[vendeurId].sommegenerée = Number(sommeParVendeur[vendeurId].sommegenerée) + Number(prixApresReduction);

        console.log(`Sommes accumulées pour le vendeur ${vendeurId} :`, sommeParVendeur[vendeurId]);

        return nouvelAchat;
      });

      const achats = await Promise.all(achatsPromises);
      console.log('Achats réalisés :', achats.map(achat => achat.toJSON()));

      // Vérifier que des achats ont été effectués
      if (!achats || achats.length === 0) {
        console.log('Aucun achat n\'a pu être effectué.');
        res.status(400).send('Aucun achat n\'a pu être effectué.');
        return;
      }

      // Mettre à jour ou créer les sommes pour chaque vendeur
      for (const vendeurId in sommeParVendeur) {
        const { sommedue, sommegenerée } = sommeParVendeur[vendeurId];
        console.log(`Mise à jour des sommes pour le vendeur ${vendeurId} :`, sommeParVendeur[vendeurId]);

        // Vérifier si une Somme existe déjà pour ce vendeur et cette session
        let somme = await Somme.findOne({
          where: {
            utilisateurId: parseInt(vendeurId, 10),
            sessionId: session.id,
          },
        });
        console.log(`Somme existante pour le vendeur ${vendeurId} et la session ${session.id} :`, somme?.toJSON());

        if (!somme) {
          // Créer une nouvelle Somme
          somme = await Somme.create({
            utilisateurId: parseInt(vendeurId, 10),
            sessionId: session.id,
            sommedue: sommedue,
            sommegenerée: sommegenerée,
          } as SommeCreationAttributes);
          console.log(`Nouvelle somme créée pour le vendeur ${vendeurId} :`, somme.toJSON());
        } else {
          // Convertir les valeurs en nombres avant l'addition
          somme.sommedue = Number(somme.sommedue) + Number(sommedue);
          somme.sommegenerée = Number(somme.sommegenerée) + Number(sommegenerée);
          await somme.save();
          console.log(`Somme mise à jour pour le vendeur ${vendeurId} :`, somme.toJSON());
        }
      }

      console.log('--- Fin de la route /acheter ---');
      res.status(201).json({
        message: 'Les jeux ont été achetés avec succès.',
        achats,
      });
    } catch (error: any) {
      console.error('Erreur attrapée dans le bloc catch :', error);
      if (error.message.startsWith('Le vendeur pour le jeu')) {
        res.status(404).send(error.message);
      } else {
        res.status(500).send("Erreur lors de l'achat des jeux.");
      }
    }
  }
);

// Route pour trouver les informations d'un jeu par son id
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const jeu = await Jeu.findByPk(req.params.id, {
      include: [
        {
          model: Licence,
          as: 'licence',
          attributes: ['nom'],
          include: [
            {
              model: Editeur,
              as: 'editeur',
            },
          ],
        },
        {
          model: Depot,
          as: 'depot',
          include: [
            {
              model: Vendeur,
              as: 'vendeur',
            },
          ],
        },
      ],
    });

    if (!jeu) {
      res.status(404).send('Jeu introuvable.');
      return;
    }

    const jeuData = {
      ...jeu.toJSON(),
      licence_name: jeu.licence?.nom,
    };

    res.status(200).json(jeuData);
  } catch (error) {
    console.error('Erreur lors de la recherche du jeu:', error);
    res.status(500).send('Erreur lors de la recherche du jeu.');
  }
});

export default router;