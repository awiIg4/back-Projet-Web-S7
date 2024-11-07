"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const express_validator_1 = require("express-validator");
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const acheteur_1 = __importDefault(require("../models/acheteur"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Middleware de validation pour la création d'un acheteur
const validateAcheteurRegister = [
    (0, express_validator_1.body)('nom')
        .notEmpty()
        .withMessage('Le nom est requis.'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('L\'email est invalide.'),
    (0, express_validator_1.body)('telephone')
        .isLength({ min: 10 })
        .withMessage('Le numéro de téléphone doit contenir au moins 10 chiffres.'),
    (0, express_validator_1.body)('adresse')
        .notEmpty()
        .withMessage('L\'adresse est requise.')
];
// Route pour créer un acheteur avec un email unique et validation
router.post('/register', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateAcheteurRegister, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { nom, email, telephone, adresse } = req.body;
    try {
        // Vérifier si un utilisateur avec cet email existe déjà
        const existingUser = await utilisateur_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).send('Un utilisateur avec cet email existe déjà.');
            return;
        }
        // Créer le nouvel utilisateur
        const nouvelUtilisateur = await utilisateur_1.default.create({
            nom,
            email,
            telephone,
            adresse,
            type_utilisateur: 'acheteur',
        });
        // Créer l'entrée associée dans la table Acheteur
        await acheteur_1.default.create({
            id: nouvelUtilisateur.id,
        });
        res.status(201).send('Compte acheteur créé avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création du compte acheteur.');
    }
});
// Middleware de validation pour la récupération d'un acheteur par email
const validateAcheteurGet = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('L\'email est invalide.')
];
// Route pour charger un acheteur grâce à son email avec validation
router.get('/:email', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, async (req, res) => {
    const { email } = req.params;
    // Optionnel : Valider le paramètre email via express-validator
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const utilisateur = await utilisateur_1.default.findOne({
            where: { email, type_utilisateur: 'acheteur' },
        });
        if (!utilisateur) {
            res.status(404).send('Acheteur non trouvé.');
            return;
        }
        res.status(200).json(utilisateur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du chargement de l\'acheteur.');
    }
});
exports.default = router;
