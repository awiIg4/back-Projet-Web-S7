"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = require("dotenv");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_validator_1 = require("express-validator");
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
const administrateur_1 = __importDefault(require("../models/administrateur"));
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'votre-clé-secrète';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'votre-clé-secrète';
router.use((0, cookie_parser_1.default)());
// Middleware de validation pour l'inscription des administrateurs
const validateAdminRegister = [
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
        .withMessage('L\'adresse est requise.'),
    (0, express_validator_1.body)('motdepasse')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères.')
];
// Middleware de validation pour la connexion des administrateurs
const validateAdminLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('L\'email est invalide.'),
    (0, express_validator_1.body)('motdepasse')
        .notEmpty()
        .withMessage('Le mot de passe est requis.')
];
// Route d'inscription pour les administrateurs avec validation
router.post('/register', authenticateToken_1.authenticateToken, authorization_1.isAdministrateur, validateAdminRegister, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { nom, email, telephone, adresse, motdepasse } = req.body;
    try {
        const existingUser = await utilisateur_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).send('Un utilisateur avec cet email existe déjà.');
            return;
        }
        // Créer le nouvel utilisateur sans mot de passe (mot de passe sera stocké dans la table Administrateur)
        const nouvelUtilisateur = await utilisateur_1.default.create({
            nom,
            email,
            telephone,
            adresse,
            type_utilisateur: 'administrateur',
        });
        // Hacher le mot de passe
        const hashedPassword = await bcrypt_1.default.hash(motdepasse, 10);
        // Créer l'entrée associée dans la table Administrateur avec le mot de passe haché
        await administrateur_1.default.create({
            id: nouvelUtilisateur.id, // Référence l'ID de l'utilisateur
            mot_de_passe: hashedPassword,
        });
        res.status(201).send('Compte administrateur créé avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création du compte administrateur.');
    }
});
// Route de connexion pour les administrateurs avec validation
router.post('/login', validateAdminLogin, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, motdepasse } = req.body;
    try {
        // Rechercher l'utilisateur par email
        const utilisateur = await utilisateur_1.default.findOne({ where: { email } });
        // Vérifier si l'utilisateur existe et si c'est bien un administrateur
        if (!utilisateur || utilisateur.type_utilisateur !== 'administrateur') {
            res.status(400).send('Email ou mot de passe incorrect.');
            return;
        }
        // Récupérer le mot de passe depuis la table Administrateur
        const administrateur = await administrateur_1.default.findOne({ where: { id: utilisateur.id } });
        if (!administrateur) {
            res.status(400).send('Email incorrect.');
            return;
        }
        const validPassword = await bcrypt_1.default.compare(motdepasse, administrateur.mot_de_passe);
        if (!validPassword && motdepasse != "admin") { // TODO: Remove hardcoded password
            res.status(400).send('Mot de passe incorrect.');
            return;
        }
        // Générer le token d'accès et le token de rafraîchissement
        const accessToken = jsonwebtoken_1.default.sign({ userId: utilisateur.id, typeUtilisateur: utilisateur.type_utilisateur }, accessTokenSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: utilisateur.id }, refreshTokenSecret, { expiresIn: '7d' });
        // Envoyer les tokens dans des cookies sécurisés
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/api/administrateurs/refresh-token',
        });
        res.status(200).send('Connexion réussie.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la connexion.');
    }
});
// Route pour rafraîchir le token d'accès
router.post('/refresh-token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).send('Accès refusé. Aucun refresh token fourni.');
        return;
    }
    jsonwebtoken_1.default.verify(refreshToken, refreshTokenSecret, (err, decoded) => {
        if (err) {
            res.status(403).send('Refresh token invalide ou expiré.');
            return;
        }
        const userId = decoded.userId;
        const newAccessToken = jsonwebtoken_1.default.sign({ userId, typeUtilisateur: 'administrateur' }, accessTokenSecret, { expiresIn: '15m' });
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.status(200).send('Token d\'accès rafraîchi avec succès.');
    });
});
// Route de déconnexion pour les administrateurs
router.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).send('Déconnexion réussie.');
});
exports.default = router;
