import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import Editeur from '../models/editeur';
import { isAdministrateur } from './administrateur';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route pour créer un nouvel éditeur
router.post('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { nom } = req.body;

  try {
    const existingEditeur = await Editeur.findOne({ where: { nom } });
    if (existingEditeur) {
      res.status(400).send('Un éditeur avec ce nom existe déjà.');
      return;
    }

    const editeur = await Editeur.create({ nom });
    res.status(201).json(editeur);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création de l\'éditeur.');
  }
});

// Route pour récupérer tous les éditeurs
router.get('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  try {
    const editeurs = await Editeur.findAll();
    res.status(200).json(editeurs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des éditeurs.');
  }
});

// Route pour récupérer un éditeur par son ID
router.get('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const editeur = await Editeur.findByPk(id);
    if (!editeur) {
      res.status(404).send('Éditeur introuvable.');
      return;
    }

    res.status(200).json(editeur);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de l\'éditeur.');
  }
});

// Route pour récupérer un éditeur par son nom
router.get('/by-name/:nom', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { nom } = req.params;

  try {
    const editeur = await Editeur.findOne({ where: { nom } });
    if (!editeur) {
      res.status(404).send('Éditeur introuvable.');
      return;
    }

    res.status(200).json(editeur);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de l\'éditeur.');
  }
});

// Route pour rechercher les 5 premiers éditeurs par nom
router.get('/search/:query', async (req: Request, res: Response): Promise<void> => {
  const { query } = req.params;

  try {
    const editeurs = await Editeur.findAll({
      where: {
        nom: {
          [Op.iLike]: `${query}%` // Recherche insensible à la casse et aux accents
        }
      },
      limit: 5
    });

    res.status(200).json(editeurs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la recherche des éditeurs.');
  }
});

// Route pour mettre à jour un éditeur
router.put('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nom } = req.body;

  try {
    const editeur = await Editeur.findByPk(id);
    if (!editeur) {
      res.status(404).send('Éditeur introuvable.');
      return;
    }

    if (nom) {
      const existingEditeur = await Editeur.findOne({ where: { nom, id: { [Op.ne]: id } } });
      if (existingEditeur) {
        res.status(400).send('Un autre éditeur avec ce nom existe déjà.');
        return;
      }
    }

    editeur.nom = nom || editeur.nom;
    await editeur.save();

    res.status(200).json(editeur);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de l\'éditeur.');
  }
});

// Route pour supprimer un éditeur
router.delete('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const editeur = await Editeur.findByPk(id);
    if (!editeur) {
      res.status(404).send('Éditeur introuvable.');
      return;
    }

    await editeur.destroy();
    res.status(200).send('Éditeur supprimé avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de l\'éditeur.');
  }
});

export default router;