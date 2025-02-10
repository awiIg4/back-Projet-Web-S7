"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
const express_validator_1 = require("express-validator");
const licence_1 = __importDefault(require("../models/licence"));
const editeur_1 = __importDefault(require("../models/editeur"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Middleware de validation pour la création et la mise à jour des licences
const validateLicence = [
    (0, express_validator_1.body)('nom')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Le nom de la licence est requis.'),
    (0, express_validator_1.body)('editeur_id')
        .isInt()
        .withMessage('L\'ID de l\'éditeur doit être un entier.'),
];
const validateLicenceParams = [
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
// Route pour créer une nouvelle licence (Administrateur uniquement)
router.post('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateLicence, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { nom, editeur_id } = req.body;
    try {
        const existingLicence = await licence_1.default.findOne({ where: { nom } });
        if (existingLicence) {
            res.status(400).send('Une licence avec ce nom existe déjà.');
            return;
        }
        const editeur = await editeur_1.default.findByPk(editeur_id);
        if (!editeur) {
            res.status(400).send('Éditeur introuvable.');
            return;
        }
        const licence = await licence_1.default.create({ nom, editeur_id });
        res.status(201).json(licence);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création de la licence.');
    }
});
// Route pour récupérer toutes les licences (Administrateur uniquement)
router.get('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, async (req, res) => {
    try {
        const licences = await licence_1.default.findAll({ include: [{ model: editeur_1.default, as: 'editeur' }] });
        res.status(200).json(licences);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des licences.');
    }
});
// Route pour récupérer une licence par son ID (Administrateur uniquement)
router.get('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateLicenceParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    try {
        const licence = await licence_1.default.findByPk(id, { include: [{ model: editeur_1.default, as: 'editeur' }] });
        if (!licence) {
            res.status(404).send('Licence introuvable.');
            return;
        }
        res.status(200).json(licence);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la licence.');
    }
});
// Route pour récupérer une licence par son nom (Administrateur uniquement)
router.get('/by-name/:nom', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateLicenceParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { nom } = req.params;
    try {
        const licence = await licence_1.default.findOne({ where: { nom }, include: [{ model: editeur_1.default, as: 'editeur' }] });
        if (!licence) {
            res.status(404).send('Licence introuvable.');
            return;
        }
        res.status(200).json(licence);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la licence.');
    }
});
// Route pour rechercher les 5 premières licences par nom (Sans sécurité)
router.get('/search/:query', validateLicenceParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { query } = req.params;
    try {
        const licences = await licence_1.default.findAll({
            where: {
                nom: {
                    [sequelize_1.Op.iLike]: `${query}%`,
                },
            },
            limit: 5,
            include: [{ model: editeur_1.default, as: 'editeur' }],
        });
        res.status(200).json(licences);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la recherche des licences.');
    }
});
// Route pour mettre à jour une licence (Administrateur uniquement)
router.put('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, [
    ...validateLicenceParams,
    (0, express_validator_1.body)('nom')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Le nom doit être une chaîne de caractères non vide.'),
    (0, express_validator_1.body)('editeur_id')
        .optional()
        .isInt()
        .withMessage('L\'ID de l\'éditeur doit être un entier.'),
], async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    const { nom, editeur_id } = req.body;
    try {
        const licence = await licence_1.default.findByPk(id);
        if (!licence) {
            res.status(404).send('Licence introuvable.');
            return;
        }
        if (nom) {
            const existingLicence = await licence_1.default.findOne({ where: { nom, id: { [sequelize_1.Op.ne]: id } } });
            if (existingLicence) {
                res.status(400).send('Une autre licence avec ce nom existe déjà.');
                return;
            }
        }
        if (editeur_id) {
            const editeur = await editeur_1.default.findByPk(editeur_id);
            if (!editeur) {
                res.status(400).send('Éditeur introuvable.');
                return;
            }
        }
        licence.nom = nom || licence.nom;
        licence.editeur_id = editeur_id || licence.editeur_id;
        await licence.save();
        res.status(200).json(licence);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de la licence.');
    }
});
// Route pour supprimer une licence (Administrateur uniquement)
router.delete('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateLicenceParams, async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    try {
        const licence = await licence_1.default.findByPk(id);
        if (!licence) {
            res.status(404).send('Licence introuvable.');
            return;
        }
        await licence.destroy();
        res.status(200).send('Licence supprimée avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de la licence.');
    }
});
exports.default = router;
