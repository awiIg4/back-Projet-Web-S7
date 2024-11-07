"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const achat_1 = __importDefault(require("../models/achat"));
const jeu_1 = __importDefault(require("../models/jeu"));
const licence_1 = __importDefault(require("../models/licence"));
const editeur_1 = __importDefault(require("../models/editeur"));
const session_1 = __importDefault(require("../models/session")); // Renommé pour éviter les conflits
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Middleware de validation pour la route GET /jeu
const validateJeu = [
    (0, express_validator_1.query)('session_id')
        .exists().withMessage('Le paramètre session_id est requis.')
        .bail()
        .isInt().withMessage('Le paramètre session_id doit être un entier.'),
    (0, express_validator_1.query)('editeur_id')
        .optional()
        .isInt().withMessage('Le paramètre editeur_id doit être un entier.'),
    (0, express_validator_1.query)('licence_id')
        .optional()
        .isInt().withMessage('Le paramètre licence_id doit être un entier.'),
];
// Route pour récupérer les stats sur les jeux
router.get('/jeux', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateJeu, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { session_id, editeur_id, licence_id } = req.query;
        const sessionId = Number(session_id);
        const editeurId = editeur_id ? Number(editeur_id) : undefined;
        const licenceId = licence_id ? Number(licence_id) : undefined;
        const session = await session_1.default.findByPk(sessionId);
        if (!session) {
            res.status(404).send('Session introuvable.');
            return;
        }
        const whereClause = {
            date_transaction: {
                [sequelize_1.Op.between]: [session.date_debut, session.date_fin],
            },
        };
        const includeClause = [
            {
                model: jeu_1.default,
                as: 'jeu',
                include: [
                    {
                        model: licence_1.default,
                        as: 'licence',
                        attributes: ['id', 'nom', 'editeur_id'],
                        where: licenceId ? { id: licenceId } : undefined,
                        include: [
                            {
                                model: editeur_1.default,
                                as: 'editeur',
                                attributes: ['id', 'nom'],
                                where: editeurId ? { id: editeurId } : undefined,
                            },
                        ],
                    },
                ],
            },
        ];
        const ventesParJour = await achat_1.default.findAll({
            where: whereClause,
            include: includeClause,
            attributes: [
                [sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('date_transaction')), 'date'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('Achat.id')), 'nombre_ventes'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('commission')), 'total_commission'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('jeu.prix')), 'total_ventes'],
            ],
            group: [
                sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('date_transaction')),
                sequelize_1.Sequelize.col('jeu.id'),
                sequelize_1.Sequelize.col('jeu.licence_id'),
                sequelize_1.Sequelize.col('jeu.prix'),
                sequelize_1.Sequelize.col('jeu.statut'),
                sequelize_1.Sequelize.col('jeu.depot_id'),
                sequelize_1.Sequelize.col('jeu.createdAt'),
                sequelize_1.Sequelize.col('jeu.updatedAt'),
                sequelize_1.Sequelize.col('jeu->licence.id'),
                sequelize_1.Sequelize.col('jeu->licence.nom'),
                sequelize_1.Sequelize.col('jeu->licence.editeur_id'),
                sequelize_1.Sequelize.col('jeu->licence->editeur.id'),
                sequelize_1.Sequelize.col('jeu->licence->editeur.nom'),
            ],
            order: [[sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('date_transaction')), 'ASC']],
        });
        res.status(200).json(ventesParJour);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des statistiques.');
    }
});
// Middleware de validation pour la route GET /taxes
const validateTaxes = [
    (0, express_validator_1.query)('session_id')
        .exists().withMessage('Le paramètre session_id est requis.')
        .bail()
        .isInt().withMessage('Le paramètre session_id doit être un entier.'),
];
// Route pour récuperer les stats sur les taxes
router.get('/taxes', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, validateTaxes, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { session_id } = req.query;
        const sessionId = Number(session_id);
        const session = await session_1.default.findByPk(sessionId);
        if (!session) {
            res.status(404).send('Session introuvable.');
            return;
        }
        const whereClause = {
            date_transaction: {
                [sequelize_1.Op.between]: [session.date_debut, session.date_fin],
            },
        };
        // Inclure également le total des ventes pour chaque heure
        const taxesParHeure = await achat_1.default.findAll({
            where: whereClause,
            attributes: [
                [sequelize_1.Sequelize.fn('TO_CHAR', sequelize_1.Sequelize.col('date_transaction'), 'YYYY-MM-DD HH24:00:00'), 'heure'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('commission')), 'total_commission'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('jeu.prix')), 'total_ventes'], // Inclure les ventes ici
            ],
            include: [
                {
                    model: jeu_1.default,
                    attributes: [],
                },
            ],
            group: [sequelize_1.Sequelize.fn('TO_CHAR', sequelize_1.Sequelize.col('date_transaction'), 'YYYY-MM-DD HH24:00:00')],
            order: [[sequelize_1.Sequelize.fn('TO_CHAR', sequelize_1.Sequelize.col('date_transaction'), 'YYYY-MM-DD HH24:00:00'), 'ASC']],
        });
        res.status(200).json(taxesParHeure);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des statistiques de taxes.');
    }
});
exports.default = router;
