"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
const express_validator_1 = require("express-validator");
const editeur_1 = __importDefault(require("../models/editeur"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Middleware de validation pour la création et la mise à jour des éditeurs
const validateEditeur = [
    (0, express_validator_1.body)('nom')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Le nom de l\'éditeur est requis.'),
];
const validateEditeurParams = [
    (0, express_validator_1.param)('id')
        .optional()
        .isInt()
        .withMessage('L\'ID doit être un entier.'),
    (0, express_validator_1.param)('nom')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Le nom doit être une chaîne de caractères non vide.'),
    (0, express_validator_1.param)('query')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('La requête de recherche doit être une chaîne de caractères non vide.'),
];
// Route pour créer un nouvel éditeur
router.post('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateEditeur, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { nom } = req.body;
    try {
        const existingEditeur = await editeur_1.default.findOne({ where: { nom } });
        if (existingEditeur) {
            res.status(400).send('Un éditeur avec ce nom existe déjà.');
            return;
        }
        const editeur = await editeur_1.default.create({ nom });
        res.status(201).json(editeur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création de l\'éditeur.');
    }
});
// Route pour récupérer tous les éditeurs
router.get('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, async (req, res) => {
    try {
        const editeurs = await editeur_1.default.findAll();
        res.status(200).json(editeurs);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des éditeurs.');
    }
});
// Route pour récupérer un éditeur par son ID
router.get('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateEditeurParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    try {
        const editeur = await editeur_1.default.findByPk(id);
        if (!editeur) {
            res.status(404).send('Éditeur introuvable.');
            return;
        }
        res.status(200).json(editeur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de l\'éditeur.');
    }
});
// Route pour récupérer un éditeur par son nom
router.get('/by-name/:nom', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateEditeurParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { nom } = req.params;
    try {
        const editeur = await editeur_1.default.findOne({ where: { nom } });
        if (!editeur) {
            res.status(404).send('Éditeur introuvable.');
            return;
        }
        res.status(200).json(editeur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de l\'éditeur.');
    }
});
// Route pour rechercher les 5 premiers éditeurs par nom (sans sécurité)
router.get('/search/:query', validateEditeurParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { query } = req.params;
    try {
        const editeurs = await editeur_1.default.findAll({
            where: {
                nom: {
                    [sequelize_1.Op.iLike]: `${query}%`,
                },
            },
            limit: 5,
        });
        res.status(200).json(editeurs);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la recherche des éditeurs.');
    }
});
// Route pour mettre à jour un éditeur
router.put('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, [
    ...validateEditeurParams,
    (0, express_validator_1.body)('nom')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Le nom doit être une chaîne de caractères non vide.'),
], async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    const { nom } = req.body;
    try {
        const editeur = await editeur_1.default.findByPk(id);
        if (!editeur) {
            res.status(404).send('Éditeur introuvable.');
            return;
        }
        if (nom) {
            const existingEditeur = await editeur_1.default.findOne({
                where: { nom, id: { [sequelize_1.Op.ne]: id } },
            });
            if (existingEditeur) {
                res.status(400).send('Un autre éditeur avec ce nom existe déjà.');
                return;
            }
        }
        editeur.nom = nom || editeur.nom;
        await editeur.save();
        res.status(200).json(editeur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de l\'éditeur.');
    }
});
// Route pour supprimer un éditeur
router.delete('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateEditeurParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    try {
        const editeur = await editeur_1.default.findByPk(id);
        if (!editeur) {
            res.status(404).send('Éditeur introuvable.');
            return;
        }
        await editeur.destroy();
        res.status(200).send('Éditeur supprimé avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de l\'éditeur.');
    }
});
exports.default = router;
