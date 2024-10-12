import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op, Sequelize } from 'sequelize';
import Jeu, { JeuCreationAttributes } from '../models/jeu';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import Vendeur from '../models/vendeur';
import Depot from '../models/depot';
import Session from '../models/session';
import CodePromo from '../models/codePromotion';
import Acheteur from '../models/acheteur';
import Somme, { SommeCreationAttributes } from '../models/somme';
import Achat, { AchatCreationAttributes } from '../models/achat';
import { isAdminOrManager } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Fonction pour supprimer les accents d'une chaîne de caractères
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Route pour rechercher des jeux
router.get('/rechercher', async (req: Request, res: Response): Promise<void> => {
  try {
    const { numpage = 1, licence, editeur, price_min, price_max } = req.query;

    // Convertir numpage en entier
    const page = parseInt(numpage as string, 10) || 1;
    const limit = 50; // Nombre de résultats par page
    const offset = (page - 1) * limit;

    // Construire la clause WHERE pour les jeux
    const whereClause: any = {
      statut: 'en vente', // On ne considère que les jeux en vente
    };

    // Filtre de prix
    if (price_min || price_max) {
      whereClause.prix = {};
      if (price_min) {
        whereClause.prix[Op.gte] = parseFloat(price_min as string);
      }
      if (price_max) {
        whereClause.prix[Op.lte] = parseFloat(price_max as string);
      }
    }

    // Construire les clauses d'inclusion pour les associations
    const includeClause: any[] = [
      {
        model: Licence,
        as: 'licence',
        where: {},
        include: [
          {
            model: Editeur,
            as: 'editeur',
            where: {},
          },
        ],
      },
      {
        model: Vendeur,
        as: 'vendeur',
      },
    ];

    // Filtre sur la licence
    if (licence) {
      const licenceName = removeAccents((licence as string).toLowerCase());
      includeClause[0].where = Sequelize.where(
        Sequelize.fn('lower', Sequelize.fn('unaccent', Sequelize.col('licence.nom'))),
        {
          [Op.like]: `%${licenceName}%`,
        }
      );
    }

    // Filtre sur l'éditeur
    if (editeur) {
      const editeurName = removeAccents((editeur as string).toLowerCase());
      includeClause[0].include[0].where = Sequelize.where(
        Sequelize.fn('lower', Sequelize.fn('unaccent', Sequelize.col('licence->editeur.nom'))),
        {
          [Op.like]: `%${editeurName}%`,
        }
      );
    }

    // Supprimer les clauses WHERE vides pour éviter d'affecter la requête
    if (Object.keys(includeClause[0].where).length === 0) {
      delete includeClause[0].where;
    }
    if (Object.keys(includeClause[0].include[0].where).length === 0) {
      delete includeClause[0].include[0].where;
    }

    // Exécuter la requête
    const jeux = await Jeu.findAll({
      where: whereClause,
      include: includeClause,
      attributes: [
        'licence_id',
        'vendeur_id',
        [Sequelize.fn('COUNT', Sequelize.col('Jeu.id')), 'quantite'],
        [Sequelize.fn('MIN', Sequelize.col('Jeu.prix')), 'prix_min'],
        [Sequelize.fn('MAX', Sequelize.col('Jeu.prix')), 'prix_max'],
      ],
      group: ['licence_id', 'vendeur_id', 'licence.id', 'licence->editeur.id', 'vendeur.id'],
      limit,
      offset,
    });

    res.status(200).json(jeux);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la recherche des jeux.');
  }
});

// Route pour déposer des jeux
router.post('/deposer', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  const { licence, quantite, prix, code_promo, id_vendeur } = req.body;

  try {
    // Vérification des données d'entrée
    if (!licence || !quantite || !prix || !id_vendeur || licence.length !== quantite.length || licence.length !== prix.length) {
      res.status(400).send('Les paramètres sont invalides ou incomplets.');
      return;
    }

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
    const session = await Session.findOne({
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
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du dépôt des jeux.');
  }
});

// Route pour mettre à jour le statut de plusieurs jeux
router.put('/updateStatus', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  const { jeux_ids, nouveau_statut } = req.body;

  try {
    // Vérification des données d'entrée
    if (!jeux_ids || !Array.isArray(jeux_ids) || jeux_ids.length === 0 || !nouveau_statut) {
      res.status(400).send('La liste des jeux et le statut sont requis.');
      return;
    }

    // Récupérer les jeux correspondants
    const jeux = await Jeu.findAll({
      where: {
        id: jeux_ids,
      },
    });

    // Vérifier si tous les jeux à mettre à jour ont été trouvés
    const jeuxIds = jeux.map((jeu) => jeu.id);
    const jeuxNonTrouves = jeux_ids.filter((id: number) => !jeuxIds.includes(id));

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
      jeux_ids: jeuxIds,
      nouveau_statut,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour du statut des jeux.');
  }
});

// Route pour récupérer une liste de jeux
router.post('/recuperer', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  const { jeux_a_recup } = req.body;

  try {
    // Vérification des données d'entrée
    if (!jeux_a_recup || !Array.isArray(jeux_a_recup) || jeux_a_recup.length === 0) {
      res.status(400).send('La liste des jeux à récupérer est invalide.');
      return;
    }

    // Récupérer les jeux correspondants et vérifier leur statut
    const jeux = await Jeu.findAll({
      where: {
        id: jeux_a_recup,
        statut: ['en vente', 'récupérable'], // Vérifier que les jeux sont en vente ou récupérables
      },
    });

    // Vérifier si tous les jeux à récupérer ont été trouvés
    const jeuxIds = jeux.map((jeu) => jeu.id);
    const jeuxNonTrouves = jeux_a_recup.filter((id: number) => !jeuxIds.includes(id));

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
});

// Route pour acheter des jeux
router.post('/acheter', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  const { jeux_a_acheter, code_promo, acheteur } = req.body;

  try {
    // Vérification des données d'entrée
    if (!jeux_a_acheter || !Array.isArray(jeux_a_acheter) || jeux_a_acheter.length === 0) {
      res.status(400).send('La liste des jeux à acheter est invalide.');
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

    // Récupérer les jeux correspondants et vérifier leur statut
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

    // Vérifier si tous les jeux à acheter ont été trouvés et sont en vente
    const jeuxIds = jeux.map((jeu) => jeu.id);
    const jeuxNonTrouves = jeux_a_acheter.filter((id: number) => !jeuxIds.includes(id));

    if (jeuxNonTrouves.length > 0) {
      res.status(400).send(`Certains jeux ne peuvent pas être achetés ou n'existent pas : ${jeuxNonTrouves.join(', ')}`);
      return;
    }

    // Récupérer la session active pour calculer la commission
    const today = new Date();
    const session = await Session.findOne({
      where: {
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today },
      },
    });

    if (!session) {
      res.status(404).send('Aucune session active trouvée.');
      return;
    }

    // Préparer un mapping pour accumuler les sommes par vendeur
    const sommeParVendeur: { [vendeurId: number]: { sommedue: number; sommegenerée: number } } = {};

    // Calculer la commission sur chaque jeu
    const achatsPromises = jeux.map(async (jeu) => {
      // Calculer le prix après réduction, si applicable
      const prixApresReduction = promo
        ? jeu.prix - (jeu.prix * reductionPourcent) / 100
        : jeu.prix;

      // Calculer la commission
      const commission = session.commission_en_pourcentage
        ? (prixApresReduction * session.valeur_commission) / 100
        : session.valeur_commission;

      // Montant dû au vendeur
      const montantDuVendeur = prixApresReduction - commission;

      // Créer l'achat dans la base de données
      const nouvelAchat = await Achat.create({
        jeu_id: jeu.id,
        acheteur_id: acheteur || null,
        date_transaction: today,
        commission: commission,
      } as AchatCreationAttributes); // Assurez-vous d'importer AchatCreationAttributes

      // Mettre à jour le statut du jeu à 'vendu'
      jeu.statut = 'vendu';
      await jeu.save();

      // Récupérer le vendeur via le dépôt
      const vendeur = jeu.depot?.vendeur;
      if (!vendeur) {
        throw new Error(`Le vendeur pour le jeu ${jeu.id} n'existe pas.`);
      }

      const vendeurId = vendeur.id;

      // Accumuler les sommes pour chaque vendeur
      if (!sommeParVendeur[vendeurId]) {
        sommeParVendeur[vendeurId] = {
          sommedue: 0,
          sommegenerée: 0,
        };
      }

      sommeParVendeur[vendeurId].sommedue += montantDuVendeur;
      sommeParVendeur[vendeurId].sommegenerée += prixApresReduction;

      return nouvelAchat;
    });

    const achats = await Promise.all(achatsPromises);

    // Mettre à jour ou créer les sommes pour chaque vendeur
    for (const vendeurId in sommeParVendeur) {
      const { sommedue, sommegenerée } = sommeParVendeur[vendeurId];

      // Vérifier si une Somme existe déjà pour ce vendeur et cette session
      let somme = await Somme.findOne({
        where: {
          utilisateurId: parseInt(vendeurId, 10), // Correction : utiliser utilisateurId au lieu de vendeurId
          sessionId: session.id,
        },
      });

      if (!somme) {
        // Créer une nouvelle Somme
        somme = await Somme.create({
          utilisateurId: parseInt(vendeurId, 10), // Correction : utiliser utilisateurId
          sessionId: session.id,
          sommedue: sommedue,
          sommegenerée: sommegenerée,
        } as SommeCreationAttributes); // Assurez-vous d'importer SommeCreationAttributes
      } else {
        // Mettre à jour la Somme existante
        somme.sommedue += sommedue;
        somme.sommegenerée += sommegenerée;
        await somme.save();
      }
    }

    res.status(201).json({
      message: 'Les jeux ont été achetés avec succès.',
      achats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'achat des jeux.");
  }
});

// Route pour consulter la somme due pour un vendeur spécifique
router.get('/sommedue/:idvendeur', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  try {
    const idvendeur = parseInt(req.params.idvendeur, 10);

    // Vérifier l'existence du vendeur
    const vendeur = await Vendeur.findByPk(idvendeur);
    if (!vendeur) {
      res.status(404).send('Vendeur introuvable.');
      return;
    }

    // Récupérer la session active
    const today = new Date();
    const session = await Session.findOne({
      where: {
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today },
      },
    });

    if (!session) {
      res.status(404).send('Aucune session active trouvée.');
      return;
    }

    // Récupérer la Somme pour le vendeur et la session
    const somme = await Somme.findOne({
      where: {
        utilisateurId: idvendeur, // Correction : utiliser utilisateurId au lieu de vendeurId
        sessionId: session.id,
      },
    });

    if (!somme) {
      res.status(404).send('Aucune somme due pour ce vendeur dans la session actuelle.');
      return;
    }

    res.status(200).json({
      sommedue: somme.sommedue,
      sommegenerée: somme.sommegenerée,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de la somme due.');
  }
});

// Route pour vider la somme due pour un vendeur spécifique
router.put('/sommedue/:idvendeur', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
  try {
    const idvendeur = parseInt(req.params.idvendeur, 10);

    // Vérifier l'existence du vendeur
    const vendeur = await Vendeur.findByPk(idvendeur);
    if (!vendeur) {
      res.status(404).send('Vendeur introuvable.');
      return;
    }

    // Récupérer la session active
    const today = new Date();
    const session = await Session.findOne({
      where: {
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today },
      },
    });

    if (!session) {
      res.status(404).send('Aucune session active trouvée.');
      return;
    }

    // Récupérer la Somme pour le vendeur et la session
    const somme = await Somme.findOne({
      where: {
        utilisateurId: idvendeur, // Correction : utiliser utilisateurId au lieu de vendeurId
        sessionId: session.id,
      },
    });

    if (!somme) {
      res.status(404).send('Aucune somme due pour ce vendeur dans la session actuelle.');
      return;
    }

    const montantRemboursé = somme.sommedue;

    // Vider la somme due
    somme.sommedue = 0;
    await somme.save();

    res.status(200).json({
      message: 'Somme due remboursée avec succès.',
      montantRemboursé: montantRemboursé,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du remboursement de la somme due.');
  }
});

export default router;