"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
const jeu_1 = __importDefault(require("../models/jeu"));
const licence_1 = __importDefault(require("../models/licence"));
const editeur_1 = __importDefault(require("../models/editeur"));
const vendeur_1 = __importDefault(require("../models/vendeur"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const depot_1 = __importDefault(require("../models/depot"));
const session_1 = __importDefault(require("../models/session"));
const somme_1 = __importDefault(require("../models/somme"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
const express_validator_1 = require("express-validator");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Middleware de gestion des erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
// Route GET /gestion/games/:numpage avec validation et middlewares
router.get('/games/:numpage', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('numpage')
        .exists().withMessage('Le paramètre numpage est requis.')
        .isInt({ min: 1 }).withMessage('Le paramètre numpage doit être un entier positif.'),
], handleValidationErrors, async (req, res) => {
    try {
        const { numpage } = req.params;
        const page = parseInt(numpage, 10) || 1;
        const limit = 50; // Nombre de résultats par page
        const offset = (page - 1) * limit;
        // Récupérer la session actuelle ou la plus récente
        const today = new Date();
        let session = await session_1.default.findOne({
            where: {
                date_debut: { [sequelize_1.Op.lte]: today },
                date_fin: { [sequelize_1.Op.gte]: today },
            },
        });
        if (!session) {
            // Si aucune session active, récupérer la plus récente
            session = await session_1.default.findOne({
                order: [['date_fin', 'DESC']],
            });
            if (!session) {
                res.status(404).send('Aucune session disponible.');
                return;
            }
        }
        // Récupérer les jeux vendus lors de la session
        const jeuxVendus = await jeu_1.default.findAll({
            where: {
                statut: 'vendu',
                updatedAt: {
                    [sequelize_1.Op.between]: [session.date_debut, session.date_fin],
                },
            },
            include: [
                {
                    model: licence_1.default,
                    as: 'licence',
                    attributes: [],
                    include: [
                        {
                            model: editeur_1.default,
                            as: 'editeur',
                            attributes: [],
                        },
                    ],
                },
            ],
            attributes: [
                [sequelize_1.Sequelize.col('licence->editeur.nom'), 'editeur_nom'],
                [sequelize_1.Sequelize.col('licence.nom'), 'licence_nom'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('Jeu.id')), 'quantite_vendue'],
            ],
            group: [
                sequelize_1.Sequelize.col('licence->editeur.nom'),
                sequelize_1.Sequelize.col('licence.nom'),
            ],
            order: [
                [sequelize_1.Sequelize.col('editeur_nom'), 'ASC'],
                [sequelize_1.Sequelize.col('licence_nom'), 'ASC'],
            ],
            limit,
            offset,
            raw: true,
        });
        res.status(200).json(jeuxVendus);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux vendus :', error);
        res.status(500).send('Erreur lors de la récupération des jeux vendus.');
    }
});
// Route GET /gestion/vendeurs/:numpage avec validation et middlewares
router.get('/vendeurs/:numpage', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('numpage')
        .exists().withMessage('Le paramètre numpage est requis.')
        .isInt({ min: 1 }).withMessage('Le paramètre numpage doit être un entier positif.'),
    (0, express_validator_1.query)('vendeur_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Le paramètre vendeur_id doit être un entier positif.'),
], handleValidationErrors, async (req, res) => {
    try {
        const { numpage } = req.params;
        const { vendeur_id } = req.query; // Vendeur ID passé en paramètre optionnel
        const page = parseInt(numpage, 10) || 1;
        const limit = 50; // Nombre de résultats par page
        const offset = (page - 1) * limit;
        // Récupérer la session actuelle ou la plus récente
        const today = new Date();
        let session = await session_1.default.findOne({
            where: {
                date_debut: { [sequelize_1.Op.lte]: today },
                date_fin: { [sequelize_1.Op.gte]: today },
            },
        });
        if (!session) {
            // Si aucune session active, récupérer la plus récente
            session = await session_1.default.findOne({
                order: [['date_fin', 'DESC']],
            });
            if (!session) {
                res.status(404).send('Aucune session disponible.');
                return;
            }
        }
        // Construire la clause WHERE
        const whereClause = {
            statut: 'vendu',
            updatedAt: {
                [sequelize_1.Op.between]: [session.date_debut, session.date_fin],
            },
        };
        if (vendeur_id) {
            whereClause['$depot.vendeur_id$'] = parseInt(vendeur_id, 10);
        }
        // Récupérer les jeux vendus lors de la session, groupés par vendeur, éditeur et licence
        const jeuxVendus = await jeu_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: depot_1.default,
                    as: 'depot',
                    attributes: [],
                    include: [
                        {
                            model: vendeur_1.default,
                            as: 'vendeur',
                            attributes: [],
                            include: [
                                {
                                    model: utilisateur_1.default,
                                    as: 'utilisateur',
                                    attributes: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: licence_1.default,
                    as: 'licence',
                    attributes: [],
                    include: [
                        {
                            model: editeur_1.default,
                            as: 'editeur',
                            attributes: [],
                        },
                    ],
                },
            ],
            attributes: [
                [sequelize_1.Sequelize.col('depot->vendeur->utilisateur.nom'), 'vendeur_nom'],
                [sequelize_1.Sequelize.col('licence->editeur.nom'), 'editeur_nom'],
                [sequelize_1.Sequelize.col('licence.nom'), 'licence_nom'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('Jeu.id')), 'quantite_vendue'],
            ],
            group: [
                sequelize_1.Sequelize.col('depot->vendeur->utilisateur.nom'),
                sequelize_1.Sequelize.col('licence->editeur.nom'),
                sequelize_1.Sequelize.col('licence.nom'),
            ],
            order: [
                [sequelize_1.Sequelize.col('vendeur_nom'), 'ASC'],
                [sequelize_1.Sequelize.col('editeur_nom'), 'ASC'],
                [sequelize_1.Sequelize.col('licence_nom'), 'ASC'],
            ],
            limit,
            offset,
            raw: true,
        });
        res.status(200).json(jeuxVendus);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux vendus :', error);
        res.status(500).send('Erreur lors de la récupération des jeux vendus.');
    }
});
// Nouvelle route GET /gestion/bilan avec validation et middlewares
router.get('/bilan', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, async (req, res) => {
    try {
        // Récupérer la session actuelle ou la plus récente
        const today = new Date();
        let session = await session_1.default.findOne({
            where: {
                date_debut: { [sequelize_1.Op.lte]: today },
                date_fin: { [sequelize_1.Op.gte]: today },
            },
        });
        if (!session) {
            // Si aucune session active, récupérer la plus récente
            session = await session_1.default.findOne({
                order: [['date_fin', 'DESC']],
            });
            if (!session) {
                res.status(404).send('Aucune session disponible.');
                return;
            }
        }
        // Récupérer les sommes pour tous les vendeurs pour la session
        const sommes = await somme_1.default.findAll({
            where: {
                sessionId: session.id,
            },
        });
        if (sommes.length === 0) {
            res.status(404).send('Aucune donnée financière pour cette session.');
            return;
        }
        // Calculer les montants totaux
        let totalGeneréParVendeurs = 0;
        let totalDûAuxVendeurs = 0;
        sommes.forEach((somme) => {
            totalGeneréParVendeurs += parseFloat(somme.sommegenerée.toString());
            totalDûAuxVendeurs += parseFloat(somme.sommedue.toString());
        });
        const argentGénéréPourAdmin = totalGeneréParVendeurs - totalDûAuxVendeurs;
        res.status(200).json({
            session: {
                id: session.id,
                date_debut: session.date_debut,
                date_fin: session.date_fin,
            },
            bilan: {
                total_generé_par_vendeurs: totalGeneréParVendeurs.toFixed(2),
                total_dû_aux_vendeurs: totalDûAuxVendeurs.toFixed(2),
                argent_généré_pour_admin: argentGénéréPourAdmin.toFixed(2),
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération du bilan financier.');
    }
});
// Route GET pour récupérer le bilan d'un vendeur spécifique
router.get('/bilan/:idvendeur', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.param)('idvendeur')
        .exists().withMessage('Le paramètre idvendeur est requis.')
        .isInt({ min: 1 }).withMessage('Le paramètre idvendeur doit être un entier positif.'),
], handleValidationErrors, async (req, res) => {
    var _a, _b;
    try {
        const idVendeur = parseInt(req.params.idvendeur, 10);
        // Vérifier l'existence du vendeur et inclure l'utilisateur
        const vendeur = await vendeur_1.default.findByPk(idVendeur, {
            include: [{ model: utilisateur_1.default, as: 'utilisateur' }],
        });
        if (!vendeur) {
            res.status(404).send('Vendeur introuvable.');
            return;
        }
        // Récupérer la session actuelle ou la plus récente
        const today = new Date();
        let session = await session_1.default.findOne({
            where: {
                date_debut: { [sequelize_1.Op.lte]: today },
                date_fin: { [sequelize_1.Op.gte]: today },
            },
        });
        if (!session) {
            // Si aucune session active, récupérer la plus récente
            session = await session_1.default.findOne({
                order: [['date_fin', 'DESC']],
            });
            if (!session) {
                res.status(404).send('Aucune session disponible.');
                return;
            }
        }
        // Récupérer les sommes pour le vendeur et la session
        const somme = await somme_1.default.findOne({
            where: {
                utilisateurId: vendeur.id, // Utiliser l'ID du vendeur
                sessionId: session.id,
            },
        });
        if (!somme) {
            res.status(404).send('Aucune donnée financière pour ce vendeur dans la session actuelle.');
            return;
        }
        // Calculer les taxes et l'argent généré pour l'administrateur
        const totalGeneréParVendeur = parseFloat(somme.sommegenerée.toString());
        const totalDûAuVendeur = parseFloat(somme.sommedue.toString());
        const argentGénéréPourAdmin = totalGeneréParVendeur - totalDûAuVendeur; // Commission prise par l'admin
        res.status(200).json({
            vendeur: {
                id: vendeur.id,
                nom: (_a = vendeur.utilisateur) === null || _a === void 0 ? void 0 : _a.nom,
                email: (_b = vendeur.utilisateur) === null || _b === void 0 ? void 0 : _b.email,
            },
            session: {
                id: session.id,
                date_debut: session.date_debut,
                date_fin: session.date_fin,
            },
            bilan: {
                total_generé_par_vendeur: totalGeneréParVendeur.toFixed(2),
                total_dû_au_vendeur: totalDûAuVendeur.toFixed(2),
                argent_généré_pour_admin: argentGénéréPourAdmin.toFixed(2),
            },
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du bilan financier :', error);
        res.status(500).send('Erreur lors de la récupération du bilan financier.');
    }
});
exports.default = router;
