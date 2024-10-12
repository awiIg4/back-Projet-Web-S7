import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import Licence, { LicenceCreationAttributes } from '../models/licence'; // Import mis à jour
import Editeur from '../models/editeur';
import { isAdministrateur } from './middleware';

config(); // Charger les variables d'environnement

const router = express.Router();

// Route pour créer une nouvelle licence
router.post('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { nom, editeur_id } = req.body;

  try {
    const existingLicence = await Licence.findOne({ where: { nom } });
    if (existingLicence) {
      res.status(400).send('Une licence avec ce nom existe déjà.');
      return;
    }

    const editeur = await Editeur.findByPk(editeur_id);
    if (!editeur) {
      res.status(400).send('Éditeur introuvable.');
      return;
    }

    const licence = await Licence.create({ nom, editeur_id } as LicenceCreationAttributes);
    res.status(201).json(licence);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création de la licence.');
  }
});

// Route pour récupérer toutes les licences
router.get('/', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  try {
    const licences = await Licence.findAll({ include: [{ model: Editeur, as: 'editeur' }] });
    res.status(200).json(licences);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des licences.');
  }
});

// Route pour récupérer une licence par son ID
router.get('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const licence = await Licence.findByPk(id, { include: [{ model: Editeur, as: 'editeur' }] });
    if (!licence) {
      res.status(404).send('Licence introuvable.');
      return;
    }

    res.status(200).json(licence);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de la licence.');
  }
});

// Route pour récupérer une licence par son nom
router.get('/by-name/:nom', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { nom } = req.params;

  try {
    const licence = await Licence.findOne({ where: { nom }, include: [{ model: Editeur, as: 'editeur' }] });
    if (!licence) {
      res.status(404).send('Licence introuvable.');
      return;
    }

    res.status(200).json(licence);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération de la licence.');
  }
});

// Route pour rechercher les 5 premières licences par nom
router.get('/search/:query', async (req: Request, res: Response): Promise<void> => {
    const { query } = req.params;
  
    try {
      const licences = await Licence.findAll({
        where: {
          nom: {
            [Op.iLike]: `${query}%` // Recherche insensible à la casse et aux accents
          }
        },
        limit: 5
      });
  
      res.status(200).json(licences);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la recherche des licences.');
    }
  });

// Route pour mettre à jour une licence
router.put('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nom, editeur_id } = req.body;

  try {
    const licence = await Licence.findByPk(id);
    if (!licence) {
      res.status(404).send('Licence introuvable.');
      return;
    }

    if (nom) {
      const existingLicence = await Licence.findOne({ where: { nom, id: { [Op.ne]: id } } });
      if (existingLicence) {
        res.status(400).send('Une autre licence avec ce nom existe déjà.');
        return;
      }
    }

    if (editeur_id) {
      const editeur = await Editeur.findByPk(editeur_id);
      if (!editeur) {
        res.status(400).send('Editeur introuvable.');
        return;
      }
    }

    licence.nom = nom || licence.nom;
    licence.editeur_id = editeur_id || licence.editeur_id;
    await licence.save();

    res.status(200).json(licence);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de la licence.');
  }
});

// Route pour supprimer une licence
router.delete('/:id', isAdministrateur, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const licence = await Licence.findByPk(id);
    if (!licence) {
      res.status(404).send('Licence introuvable.');
      return;
    }

    await licence.destroy();
    res.status(200).send('Licence supprimée avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de la licence.');
  }
});

export default router;