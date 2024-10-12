// src/routes/gestion.ts

import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op, Sequelize } from 'sequelize';
import Jeu from '../models/jeu';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import Vendeur from '../models/vendeur';
import Utilisateur from '../models/utilisateur'; // Import du modèle Utilisateur
import Session from '../models/session';
import Somme from '../models/somme';
import { isAdminOrManager } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route GET /gestion/bilan/:idvendeur
router.get('/bilan/:idvendeur', isAdminOrManager, async (req: Request, res: Response): Promise<void> => {
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
    let session = await Session.findOne({
      where: {
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today },
      },
    });

    if (!session) {
      // Si aucune session active, récupérer la plus récente
      session = await Session.findOne({
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
        utilisateurId: idVendeur, // Remplacer vendeurId par utilisateurId
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
    console.error(error);
    res.status(500).send('Erreur lors de la récupération du bilan financier.');
  }
});

// Les autres routes restent inchangées

export default router;