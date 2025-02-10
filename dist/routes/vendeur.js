"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const vendeur_1 = __importDefault(require("../models/vendeur"));
const jeu_1 = __importDefault(require("../models/jeu"));
const depot_1 = __importDefault(require("../models/depot"));
const somme_1 = __importDefault(require("../models/somme"));
const licence_1 = __importDefault(require("../models/licence"));
const session_1 = __importDefault(require("../models/session"));
const express_validator_1 = require("express-validator"); // Import ajouté
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Middlewares de validation
const validateVendeurRegister = [
    (0, express_validator_1.body)('nom').notEmpty().withMessage('Le nom est requis'),
    (0, express_validator_1.body)('email').isEmail().withMessage('L\'email est invalide'),
    (0, express_validator_1.body)('telephone')
        .matches(/^\d{10}$/)
        .withMessage('Le numéro de téléphone doit contenir exactement 10 chiffres'),
    (0, express_validator_1.body)('adresse').notEmpty().withMessage('L\'adresse est requise'),
];
const validateEmailParam = [
    (0, express_validator_1.param)('email').isEmail().withMessage('L\'email est invalide'),
];
const validateIdSessionVendeurParams = [
    (0, express_validator_1.param)('idsession')
        .isInt({ gt: 0 })
        .withMessage('idsession doit être un entier positif'),
    (0, express_validator_1.param)('idvendeur')
        .isInt({ gt: 0 })
        .withMessage('idvendeur doit être un entier positif'),
    (0, express_validator_1.query)('numpage')
        .optional()
        .isInt({ gt: 0 })
        .withMessage('numpage doit être un entier positif'),
];
const validateSommeParams = [
    (0, express_validator_1.param)('idsession')
        .isInt({ gt: 0 })
        .withMessage('idsession doit être un entier positif'),
    (0, express_validator_1.query)('idvendeur')
        .isInt({ gt: 0 })
        .withMessage('idvendeur doit être un entier positif'),
];
const validateStatsParam = [
    (0, express_validator_1.param)('idvendeur')
        .isInt({ gt: 0 })
        .withMessage('idvendeur doit être un entier positif'),
];
// Route pour créer un vendeur avec un email unique
router.post('/register', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateVendeurRegister, async (req, res) => {
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
            type_utilisateur: 'vendeur',
        });
        // Créer l'entrée associée dans la table Vendeur
        await vendeur_1.default.create({
            id: nouvelUtilisateur.id,
        });
        res.status(201).send('Compte vendeur créé avec succès.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création du compte vendeur.');
    }
});
// Route pour charger un vendeur grâce à son email 
router.get('/:email', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateEmailParam, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email } = req.params;
    try {
        const utilisateur = await utilisateur_1.default.findOne({
            where: { email, type_utilisateur: 'vendeur' },
        });
        if (!utilisateur) {
            res.status(404).send('Vendeur non trouvé.');
            return;
        }
        res.status(200).json(utilisateur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du chargement du vendeur.');
    }
});
// Route pour récupérer les informations d'un vendeur 
router.get('/informations/:id', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [(0, express_validator_1.param)('id').isInt({ gt: 0 }).withMessage('id doit être un entier positif'),], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    try {
        const utilisateur = await utilisateur_1.default.findByPk(id, {
            attributes: ['id', 'nom', 'email', 'telephone', 'adresse', 'type_utilisateur'],
        });
        if (!utilisateur || utilisateur.type_utilisateur !== 'vendeur') {
            res.status(404).send('Vendeur non trouvé.');
            return;
        }
        res.status(200).json(utilisateur);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des informations du vendeur.');
    }
});
// Route pour récupérer les jeux pour une session et un vendeur
router.get('/stock/:idsession/:idvendeur', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateIdSessionVendeurParams, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);
    const numpage = Number(req.query.numpage) || 1;
    try {
        // Vérifier que le vendeur existe
        const vendeur = await vendeur_1.default.findByPk(idvendeur);
        if (!vendeur) {
            res.status(404).send('Vendeur non trouvé.');
            return;
        }
        const jeux = await jeu_1.default.findAll({
            where: {
                statut: {
                    [sequelize_1.Op.in]: ['en vente', 'vendu', 'récuperable', 'récupéré'],
                },
            },
            include: [
                {
                    model: depot_1.default,
                    as: 'depot',
                    required: true,
                    include: [
                        {
                            model: session_1.default,
                            as: 'session',
                            required: true,
                            where: {
                                id: idsession,
                            },
                        },
                        {
                            model: vendeur_1.default,
                            as: 'vendeur',
                            where: {
                                id: idvendeur,
                            },
                        },
                    ],
                },
            ],
            limit: 10,
            offset: (numpage - 1) * 10,
        });
        res.status(200).json(jeux);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des jeux pour la session.');
    }
});
// Route pour récupérer les jeux pour une session, un vendeur et un statut donné
router.get('/stock/:idsession/:idvendeur/:statut', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    (0, express_validator_1.param)('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
    (0, express_validator_1.param)('statut')
        .isString()
        .custom((value) => {
        const statutsValides = ['en vente', 'vendu', 'récuperable', 'récupéré'];
        if (!statutsValides.includes(value.toLowerCase())) {
            throw new Error('Statut invalide.');
        }
        return true;
    }),
], validateIdSessionVendeurParams, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);
    const statut = req.params.statut.toLowerCase();
    const numpage = Number(req.query.numpage) || 1;
    try {
        // Vérifier que le vendeur existe
        const vendeur = await vendeur_1.default.findByPk(idvendeur);
        if (!vendeur) {
            res.status(404).send('Vendeur non trouvé.');
            return;
        }
        // Rechercher les jeux avec le statut donné
        const jeux = await jeu_1.default.findAll({
            where: {
                statut: statut,
            },
            include: [
                {
                    model: depot_1.default,
                    as: 'depot',
                    required: true,
                    include: [
                        {
                            model: session_1.default,
                            as: 'session',
                            required: true,
                            where: {
                                id: idsession,
                            },
                        },
                        {
                            model: vendeur_1.default,
                            as: 'vendeur',
                            where: {
                                id: idvendeur,
                            },
                        },
                    ],
                },
            ],
            limit: 10,
            offset: (numpage - 1) * 10,
        });
        res.status(200).json(jeux);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des jeux pour la session et le statut.');
    }
});
// Route pour récupérer la somme due au vendeur pour une session
router.get('/sommedue/:idsession/:idvendeur', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    (0, express_validator_1.param)('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);
    try {
        const somme = await somme_1.default.findOne({
            where: {
                utilisateurId: idvendeur,
                sessionId: idsession,
            },
            attributes: ['sommedue'],
        });
        if (!somme) {
            res.status(404).send('Aucune somme due trouvée pour cette session.');
            return;
        }
        res.status(200).json({ sommedue: somme.sommedue });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la somme due.');
    }
});
// Route pour mettre à jour la somme due à zéro pour une session et un vendeur
router.put('/sommedue/:idsession/:idvendeur', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    (0, express_validator_1.param)('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);
    try {
        // Rechercher la somme due
        const somme = await somme_1.default.findOne({
            where: {
                utilisateurId: idvendeur,
                sessionId: idsession,
            },
        });
        if (!somme) {
            res.status(404).send('Aucune somme due trouvée pour cette session.');
            return;
        }
        // Mettre à jour la somme due à zéro
        somme.sommedue = 0;
        await somme.save();
        res.status(200).json({ message: 'Somme due mise à jour à zéro.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de la somme due.');
    }
});
// Route pour récupérer l'argent généré par les ventes pour une session avec validation
router.get('/argentgagne/:idsession/:idvendeur', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('idsession').isInt({ gt: 0 }).withMessage('idsession doit être un entier positif'),
    (0, express_validator_1.param)('idvendeur').isInt({ gt: 0 }).withMessage('idvendeur doit être un entier positif'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const idsession = Number(req.params.idsession);
    const idvendeur = Number(req.params.idvendeur);
    try {
        const somme = await somme_1.default.findOne({
            where: {
                utilisateurId: idvendeur,
                sessionId: idsession,
            },
            attributes: ['sommegenerée'],
        });
        if (!somme) {
            res.status(404).send('Aucune somme générée trouvée pour cette session.');
        }
        else {
            res.status(200).json({ sommegenerée: somme.sommegenerée });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la récupération de l'argent généré.");
    }
});
// Middleware de validation pour les statistiques
const validateStatsParams = [
    (0, express_validator_1.param)('idvendeur')
        .isInt()
        .withMessage('L\'ID du vendeur doit être un entier.'),
];
router.get('/stats/:idvendeur', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateStatsParams, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const idvendeur = Number(req.params.idvendeur);
    try {
        // Vérifier que le vendeur existe
        const vendeur = await vendeur_1.default.findByPk(idvendeur);
        if (!vendeur) {
            res.status(404).send('Vendeur non trouvé.');
            return;
        }
        const stats = await jeu_1.default.findAll({
            where: {
                statut: 'vendu',
            },
            attributes: [
                'licence_id',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('Jeu.id')), 'quantiteVendu'],
            ],
            include: [
                {
                    model: licence_1.default,
                    as: 'licence',
                    attributes: ['nom'],
                },
                {
                    model: depot_1.default,
                    as: 'depot',
                    required: true,
                    where: {
                        vendeur_id: idvendeur,
                    },
                    attributes: [],
                },
            ],
            group: ['licence_id', 'licence.nom'],
            raw: true,
        });
        res.status(200).json(stats);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des statistiques des jeux vendus.');
    }
});
exports.default = router;
