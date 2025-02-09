"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const router = express_1.default.Router();
router.get('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, async (req, res) => {
    try {
        const utilisateurs = await utilisateur_1.default.findAll();
        res.status(200).json(utilisateurs);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des utilisateurs.');
    }
});
router.put('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, async (req, res) => {
    const { id } = req.params;
    const { nom, telephone, adresse } = req.body;
    try {
        const utilisateur = await utilisateur_1.default.findByPk(id);
        if (!utilisateur) {
            res.status(404).send('Utilisateur introuvable.');
            return;
        }
        utilisateur.nom = nom || utilisateur.nom;
        utilisateur.telephone = telephone || utilisateur.telephone;
        utilisateur.adresse = adresse || utilisateur.adresse;
        await utilisateur.save();
        res.status(200).json(utilisateur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de l\'utilisateur.');
    }
});
router.delete('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, async (req, res) => {
    const { id } = req.params;
    try {
        const utilisateur = await utilisateur_1.default.findByPk(id);
        if (!utilisateur) {
            res.status(404).send('Utilisateur introuvable.');
            return;
        }
        await utilisateur.destroy();
        res.status(200).send('Utilisateur supprimé avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de l\'utilisateur.');
    }
});
exports.default = router;
