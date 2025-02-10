"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
const codePromotion_1 = __importDefault(require("../models/codePromotion"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
const express_validator_1 = require("express-validator");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Middleware de validation pour la création et la mise à jour des codes promo
const validateCodePromo = [
    (0, express_validator_1.body)('libelle')
        .isString()
        .notEmpty()
        .withMessage('Le libellé du code promo est requis.'),
    (0, express_validator_1.body)('reductionPourcent')
        .isInt({ min: 0, max: 100 })
        .withMessage('La réduction doit être un entier entre 0 et 100.'),
];
const validateLibelle = [
    (0, express_validator_1.param)('libelle')
        .isString()
        .notEmpty()
        .withMessage('Le libellé du code promo doit être une chaîne de caractères non vide.'),
];
const validateSearchQuery = [
    (0, express_validator_1.param)('query')
        .isString()
        .notEmpty()
        .withMessage('La requête de recherche doit être une chaîne de caractères non vide.'),
];
// Route pour récupérer tous les codes promo (administrateur et gestionnaire uniquement)
router.get('/', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, async (req, res) => {
    try {
        const codesPromo = await codePromotion_1.default.findAll();
        res.status(200).json(codesPromo);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des codes promo.');
    }
});
// Route pour récupérer la réduction associée à un code promo (administrateur et gestionnaire uniquement)
router.get('/:codepromo', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('codepromo')
        .isString()
        .notEmpty()
        .withMessage('Le code promo doit être une chaîne de caractères non vide.'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { codepromo } = req.params;
    try {
        const codePromo = await codePromotion_1.default.findOne({ where: { libelle: codepromo } });
        if (!codePromo) {
            res.status(404).send('Code promo introuvable.');
            return;
        }
        res.status(200).json({ reduction: codePromo.reductionPourcent });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération du code promo.');
    }
});
// Route pour créer un nouveau code promo (administrateur uniquement)
router.post('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateCodePromo, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { libelle, reductionPourcent } = req.body;
    try {
        const existingCodePromo = await codePromotion_1.default.findOne({ where: { libelle } });
        if (existingCodePromo) {
            res.status(400).send('Un code promo avec ce libellé existe déjà.');
            return;
        }
        const codePromo = await codePromotion_1.default.create({ libelle, reductionPourcent });
        res.status(201).json(codePromo);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création du code promo.');
    }
});
// Route pour mettre à jour un code promo (administrateur uniquement)
router.put('/:libelle', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, [
    ...validateLibelle,
    (0, express_validator_1.body)('libelle')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('Le libellé du code promo doit être une chaîne de caractères non vide.'),
    (0, express_validator_1.body)('reductionPourcent')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('La réduction doit être un entier entre 0 et 100.'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { libelle } = req.params;
    const { libelle: newLibelle, reductionPourcent } = req.body;
    try {
        const codePromo = await codePromotion_1.default.findOne({ where: { libelle } });
        if (!codePromo) {
            res.status(404).send('Code promo introuvable.');
            return;
        }
        if (newLibelle) {
            const existingCodePromo = await codePromotion_1.default.findOne({
                where: { libelle: newLibelle },
            });
            if (existingCodePromo && existingCodePromo.libelle !== libelle) {
                res.status(400).send('Un autre code promo avec ce libellé existe déjà.');
                return;
            }
            codePromo.libelle = newLibelle;
        }
        if (reductionPourcent !== undefined) {
            codePromo.reductionPourcent = reductionPourcent;
        }
        await codePromo.save();
        res.status(200).json(codePromo);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour du code promo.');
    }
});
// Route pour supprimer un code promo (administrateur uniquement)
router.delete('/:libelle', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateLibelle, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { libelle } = req.params;
    try {
        const codePromo = await codePromotion_1.default.findOne({ where: { libelle } });
        if (!codePromo) {
            res.status(404).send('Code promo introuvable.');
            return;
        }
        await codePromo.destroy();
        res.status(200).send('Code promo supprimé avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression du code promo.');
    }
});
// Route pour rechercher les 5 premiers codes promo par libellé (sans sécurité)
router.get('/search/:query', validateSearchQuery, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { query } = req.params;
    try {
        const codesPromo = await codePromotion_1.default.findAll({
            where: {
                libelle: {
                    [sequelize_1.Op.iLike]: `${query}%`,
                },
            },
            limit: 5,
        });
        res.status(200).json(codesPromo);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la recherche des codes promo.');
    }
});
exports.default = router;
