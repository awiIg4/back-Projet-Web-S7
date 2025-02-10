"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
const session_1 = __importDefault(require("../models/session")); // Assurez-vous que ce chemin est correct
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
const express_validator_1 = require("express-validator");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Middleware de validation pour la création des sessions
const validateCreateSession = [
    (0, express_validator_1.body)('date_debut')
        .isISO8601()
        .withMessage('La date de début doit être une date valide au format ISO8601.'),
    (0, express_validator_1.body)('date_fin')
        .isISO8601()
        .withMessage('La date de fin doit être une date valide au format ISO8601.')
        .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.date_debut)) {
            throw new Error('La date de fin doit être postérieure à la date de début.');
        }
        return true;
    }),
    (0, express_validator_1.body)('valeur_commission')
        .isInt({ min: 0 })
        .withMessage('La valeur de la commission doit être un entier positif.'),
    (0, express_validator_1.body)('commission_en_pourcentage')
        .isBoolean()
        .withMessage('Le champ commission_en_pourcentage doit être un booléen.'),
    (0, express_validator_1.body)('valeur_frais_depot')
        .isInt({ min: 0 })
        .withMessage('La valeur des frais de dépôt doit être un entier positif.'),
    (0, express_validator_1.body)('frais_depot_en_pourcentage')
        .isBoolean()
        .withMessage('Le champ frais_depot_en_pourcentage doit être un booléen.'),
];
// Middleware de validation pour la mise à jour des sessions
const validateUpdateSession = [
    (0, express_validator_1.param)('id')
        .isInt()
        .withMessage('L\'ID de la session doit être un entier.'),
    (0, express_validator_1.body)('date_debut')
        .optional()
        .isISO8601()
        .withMessage('La date de début doit être une date valide au format ISO8601.'),
    (0, express_validator_1.body)('date_fin')
        .optional()
        .isISO8601()
        .withMessage('La date de fin doit être une date valide au format ISO8601.')
        .custom((value, { req }) => {
        if (req.body.date_debut && new Date(value) <= new Date(req.body.date_debut)) {
            throw new Error('La date de fin doit être postérieure à la date de début.');
        }
        return true;
    }),
    (0, express_validator_1.body)('valeur_commission')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La valeur de la commission doit être un entier positif.'),
    (0, express_validator_1.body)('commission_en_pourcentage')
        .optional()
        .isBoolean()
        .withMessage('Le champ commission_en_pourcentage doit être un booléen.'),
    (0, express_validator_1.body)('valeur_frais_depot')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La valeur des frais de dépôt doit être un entier positif.'),
    (0, express_validator_1.body)('frais_depot_en_pourcentage')
        .optional()
        .isBoolean()
        .withMessage('Le champ frais_depot_en_pourcentage doit être un booléen.'),
];
// Middleware de validation pour les paramètres ID
const validateSessionId = [
    (0, express_validator_1.param)('id')
        .isInt()
        .withMessage('L\'ID de la session doit être un entier.'),
];
// Route pour créer une nouvelle session
router.post('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateCreateSession, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { date_debut, date_fin, valeur_commission, commission_en_pourcentage, valeur_frais_depot, frais_depot_en_pourcentage, } = req.body;
    try {
        const session = await session_1.default.create({
            date_debut,
            date_fin,
            valeur_commission,
            commission_en_pourcentage,
            valeur_frais_depot,
            frais_depot_en_pourcentage,
        });
        res.status(201).json(session);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création de la session.');
    }
});
// Route pour récupérer toutes les sessions
router.get('/', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, async (req, res) => {
    try {
        const sessions = await session_1.default.findAll();
        res.status(200).json(sessions);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des sessions.');
    }
});
// Route pour récupérer la session courante
router.get('/current', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, async (req, res) => {
    try {
        const today = new Date();
        const session = await session_1.default.findOne({
            where: {
                date_debut: { [sequelize_1.Op.lte]: today },
                date_fin: { [sequelize_1.Op.gte]: today },
            },
        });
        if (!session) {
            res.status(404).send('Aucune session courante.');
            return;
        }
        res.status(200).json(session);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la session courante.');
    }
});
// Route pour récupérer une session par son ID
router.get('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateSessionId, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    try {
        const session = await session_1.default.findByPk(id);
        if (!session) {
            res.status(404).send('Session introuvable.');
            return;
        }
        res.status(200).json(session);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la session.');
    }
});
// Route pour mettre à jour une session
router.put('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateUpdateSession, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    const { date_debut, date_fin, valeur_commission, commission_en_pourcentage, valeur_frais_depot, frais_depot_en_pourcentage, } = req.body;
    try {
        const session = await session_1.default.findByPk(id);
        if (!session) {
            res.status(404).send('Session introuvable.');
            return;
        }
        if (date_debut !== undefined)
            session.date_debut = date_debut;
        if (date_fin !== undefined)
            session.date_fin = date_fin;
        if (valeur_commission !== undefined)
            session.valeur_commission = valeur_commission;
        if (commission_en_pourcentage !== undefined)
            session.commission_en_pourcentage = commission_en_pourcentage;
        if (valeur_frais_depot !== undefined)
            session.valeur_frais_depot = valeur_frais_depot;
        if (frais_depot_en_pourcentage !== undefined)
            session.frais_depot_en_pourcentage = frais_depot_en_pourcentage;
        await session.save();
        res.status(200).json(session);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de la session.');
    }
});
// Route pour supprimer une session
router.delete('/:id', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateSessionId, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    try {
        const session = await session_1.default.findByPk(id);
        if (!session) {
            res.status(404).send('Session introuvable.');
            return;
        }
        await session.destroy();
        res.status(200).send('Session supprimée avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de la session.');
    }
});
exports.default = router;
