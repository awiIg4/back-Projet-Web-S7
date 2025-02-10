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
const depot_1 = __importDefault(require("../models/depot"));
const session_1 = __importDefault(require("../models/session"));
const codePromotion_1 = __importDefault(require("../models/codePromotion"));
const acheteur_1 = __importDefault(require("../models/acheteur"));
const somme_1 = __importDefault(require("../models/somme"));
const achat_1 = __importDefault(require("../models/achat"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const authorization_1 = require("../middleware/authorization");
const express_validator_1 = require("express-validator");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const router = express_1.default.Router();
// Fonction pour supprimer les accents d'une chaîne de caractères
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
// Middleware de gestion des erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
router.get('/rechercher', [
    (0, express_validator_1.query)('numpage')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Le paramètre numpage doit être un entier positif.'),
    (0, express_validator_1.query)('licence')
        .optional()
        .isString()
        .withMessage('Le paramètre licence doit être une chaîne de caractères.'),
    (0, express_validator_1.query)('editeur')
        .optional()
        .isString()
        .withMessage('Le paramètre editeur doit être une chaîne de caractères.'),
    (0, express_validator_1.query)('price_min')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le paramètre price_min doit être un nombre positif.'),
    (0, express_validator_1.query)('price_max')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le paramètre price_max doit être un nombre positif.'),
], handleValidationErrors, async (req, res) => {
    try {
        const { numpage = '1', licence, editeur, price_min, price_max } = req.query;
        // Convertir numpage en entier
        const page = parseInt(numpage, 10) || 1;
        const limit = 50; // Nombre de résultats par page
        const offset = (page - 1) * limit;
        // Construire la clause WHERE pour les jeux
        const whereClause = {
            statut: 'en vente', // On ne considère que les jeux en vente
        };
        // Filtre de prix
        if (price_min || price_max) {
            whereClause.prix = {};
            if (price_min) {
                whereClause.prix[sequelize_1.Op.gte] = parseFloat(price_min);
            }
            if (price_max) {
                whereClause.prix[sequelize_1.Op.lte] = parseFloat(price_max);
            }
        }
        // Construire les clauses d'inclusion pour les associations
        const includeClause = [
            {
                model: licence_1.default,
                as: 'licence',
                required: true,
                include: [
                    {
                        model: editeur_1.default,
                        as: 'editeur',
                        required: true,
                    },
                ],
            },
        ];
        // Filtre sur la licence
        if (licence) {
            const licenceName = removeAccents(licence.toLowerCase());
            includeClause[0].where = sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('lower', sequelize_1.Sequelize.col('licence.nom')), {
                [sequelize_1.Op.like]: `%${licenceName}%`,
            });
        }
        // Filtre sur l'éditeur
        if (editeur) {
            const editeurName = removeAccents(editeur.toLowerCase());
            includeClause[0].include[0].where = sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('lower', sequelize_1.Sequelize.col('licence->editeur.nom')), {
                [sequelize_1.Op.like]: `%${editeurName}%`,
            });
        }
        // Exécuter la requête
        const jeux = await jeu_1.default.findAll({
            where: whereClause,
            include: includeClause,
            attributes: [
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('Jeu.id')), 'quantite'],
                [(0, sequelize_1.fn)('MIN', (0, sequelize_1.col)('Jeu.prix')), 'prix_min'],
                [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('Jeu.prix')), 'prix_max'],
                [(0, sequelize_1.col)('licence.nom'), 'licence_nom'],
                [(0, sequelize_1.col)('licence.editeur.nom'), 'editeur_nom'],
            ],
            group: [
                (0, sequelize_1.col)('licence.id'),
                (0, sequelize_1.col)('licence.nom'),
                (0, sequelize_1.col)('licence.editeur.id'),
                (0, sequelize_1.col)('licence.editeur.nom'),
            ],
            limit,
            offset,
            subQuery: false, // Ajouté pour éviter les erreurs de sous-requêtes
        });
        res.status(200).json(jeux);
    }
    catch (error) {
        console.error('Erreur lors de la recherche des jeux:', error);
        res.status(500).send('Erreur lors de la recherche des jeux.');
    }
});
// Route pour trouver les jeux à mettre en rayon
router.get('/pas_en_rayon', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, async (req, res) => {
    try {
        const jeux = await jeu_1.default.findAll({
            where: {
                statut: 'récuperable',
            },
            include: [
                {
                    model: depot_1.default,
                    as: 'depot',
                    include: [
                        {
                            model: vendeur_1.default,
                            as: 'vendeur',
                        },
                    ],
                },
            ],
        });
        res.status(200).json(jeux);
    }
    catch (error) {
        console.error('Erreur lors de la recherche des jeux à mettre en rayon:', error);
        res.status(500).send('Erreur lors de la recherche des jeux à mettre en rayon.');
    }
});
// Route pour déposer des jeux pour un vendeur 
router.post('/deposer', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.body)('licence')
        .exists().withMessage('Le champ licence est requis.')
        .isArray({ min: 1 }).withMessage('Le champ licence doit être un tableau non vide.')
        .custom((licence) => licence.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Chaque licence doit être un entier positif.'),
    (0, express_validator_1.body)('quantite')
        .exists().withMessage('Le champ quantite est requis.')
        .isArray({ min: 1 }).withMessage('Le champ quantite doit être un tableau non vide.')
        .custom((quantite) => quantite.every(q => Number.isInteger(q) && q > 0))
        .withMessage('Chaque quantite doit être un entier positif.'),
    (0, express_validator_1.body)('prix')
        .exists().withMessage('Le champ prix est requis.')
        .isArray({ min: 1 }).withMessage('Le champ prix doit être un tableau non vide.')
        .custom((prix) => prix.every(p => typeof p === 'number' && p >= 0))
        .withMessage('Chaque prix doit être un nombre positif ou nul.'),
    (0, express_validator_1.body)('code_promo')
        .optional({ nullable: true })
        .isString().withMessage('Le champ code_promo doit être une chaîne de caractères.'),
    (0, express_validator_1.body)('id_vendeur')
        .exists().withMessage('Le champ id_vendeur est requis.')
        .isInt({ min: 1 }).withMessage('Le champ id_vendeur doit être un entier positif.'),
], handleValidationErrors, async (req, res) => {
    const { licence, quantite, prix, code_promo, id_vendeur } = req.body;
    try {
        // Vérifier l'existence du vendeur
        const vendeur = await vendeur_1.default.findByPk(id_vendeur);
        if (!vendeur) {
            res.status(404).send('Vendeur introuvable.');
            return;
        }
        // Vérifier le code promo (si fourni)
        let promo = null;
        let reductionPourcent = 0;
        if (code_promo) {
            promo = await codePromotion_1.default.findOne({ where: { libelle: code_promo } });
            if (promo) {
                reductionPourcent = promo.reductionPourcent;
            }
            else {
                res.status(404).send('Code promo invalide.');
                return;
            }
        }
        // Récupérer la session active
        const today = new Date();
        const session = await session_1.default.findOne({
            where: {
                date_debut: { [sequelize_1.Op.lte]: today },
                date_fin: { [sequelize_1.Op.gte]: today },
            },
        });
        if (!session) {
            res.status(404).send('Aucune session active trouvée.');
            return;
        }
        // Calculer la somme des prix des jeux à déposer et la quantité totale
        const totalPrixJeux = prix.reduce((acc, val, index) => acc + val * quantite[index], 0);
        const totalQuantite = quantite.reduce((acc, val) => acc + val, 0);
        // Calculer les frais de dépôt en fonction des paramètres de la session
        let fraisDepot = 0;
        if (session.frais_depot_en_pourcentage) {
            fraisDepot = (totalPrixJeux * session.valeur_frais_depot) / 100;
        }
        else {
            fraisDepot = totalQuantite * session.valeur_frais_depot;
        }
        // Appliquer la réduction si un code promo valide est fourni
        if (reductionPourcent > 0) {
            fraisDepot = fraisDepot - (fraisDepot * reductionPourcent) / 100;
        }
        // Créer un dépôt pour ce vendeur et cette session
        const depot = await depot_1.default.create({
            vendeur_id: id_vendeur,
            session_id: session.id,
            date_depot: today,
            frais_depot: fraisDepot,
        });
        // Parcourir les licences et créer les jeux
        const jeuxPromises = licence.map(async (licenceId, index) => {
            const currentLicence = await licence_1.default.findByPk(licenceId);
            if (!currentLicence) {
                throw new Error(`Licence avec l'ID ${licenceId} introuvable.`);
            }
            // Créer les jeux en fonction de la quantité pour chaque licence
            for (let i = 0; i < quantite[index]; i++) {
                await jeu_1.default.create({
                    licence_id: licenceId, // Correction : utiliser licence_id au lieu de id
                    prix: prix[index],
                    statut: 'récuperable',
                    depot_id: depot.id, // Associer directement le jeu au dépôt
                }); // Assurez-vous d'importer JeuCreationAttributes
            }
        });
        await Promise.all(jeuxPromises);
        res.status(201).json({
            message: 'Dépôt effectué avec succès et jeux créés.',
            fraisDepot: fraisDepot.toFixed(2),
        });
    }
    catch (error) {
        console.error(error);
        if (error.message.startsWith('Licence avec l\'ID')) {
            res.status(404).send(error.message);
        }
        else {
            res.status(500).send('Erreur lors du dépôt des jeux.');
        }
    }
});
// Route pour mettre à jour le status d'un ou plusieurs jeux
router.put('/updateStatus', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.body)('jeux_ids')
        .exists().withMessage('Le champ jeux_ids est requis.')
        .isArray({ min: 1 }).withMessage('Le champ jeux_ids doit être un tableau non vide.')
        .custom((jeux_ids) => jeux_ids.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Chaque jeu_id doit être un entier positif.'),
    (0, express_validator_1.body)('nouveau_statut')
        .exists().withMessage('Le champ nouveau_statut est requis.')
        .isIn(['en vente', 'récuperable', 'vendu', 'récupéré'])
        .withMessage('Le champ nouveau_statut doit être une valeur valide.'),
], handleValidationErrors, async (req, res) => {
    const { jeux_ids, nouveau_statut } = req.body;
    try {
        // Récupérer les jeux correspondants
        const jeux = await jeu_1.default.findAll({
            where: {
                id: jeux_ids,
            },
        });
        // Vérifier si tous les jeux à mettre à jour ont été trouvés
        const jeuxIdsTrouves = jeux.map((jeu) => jeu.id);
        const jeuxNonTrouves = jeux_ids.filter((id) => !jeuxIdsTrouves.includes(id));
        if (jeuxNonTrouves.length > 0) {
            res.status(400).send(`Certains jeux ne peuvent pas être trouvés ou n'existent pas : ${jeuxNonTrouves.join(', ')}`);
            return;
        }
        // Mettre à jour le statut de chaque jeu
        await Promise.all(jeux.map((jeu) => {
            jeu.statut = nouveau_statut;
            return jeu.save();
        }));
        res.status(200).json({
            message: 'Le statut des jeux a été mis à jour avec succès.',
            jeux_ids: jeuxIdsTrouves,
            nouveau_statut,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour du statut des jeux.');
    }
});
// Route pour qu'un vendeur récupère ses jeux
router.post('/recuperer', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.body)('jeux_a_recup')
        .exists().withMessage('Le champ jeux_a_recup est requis.')
        .isArray({ min: 1 }).withMessage('Le champ jeux_a_recup doit être un tableau non vide.')
        .custom((jeux_a_recup) => jeux_a_recup.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Chaque jeu_id dans jeux_a_recup doit être un entier positif.'),
], handleValidationErrors, async (req, res) => {
    const { jeux_a_recup } = req.body;
    try {
        // Récupérer les jeux correspondants et vérifier leur statut
        const jeux = await jeu_1.default.findAll({
            where: {
                id: jeux_a_recup,
                statut: ['en vente', 'récupérable'],
            },
        });
        // Vérifier si tous les jeux à récupérer ont été trouvés
        const jeuxIdsTrouves = jeux.map((jeu) => jeu.id);
        const jeuxNonTrouves = jeux_a_recup.filter((id) => !jeuxIdsTrouves.includes(id));
        if (jeuxNonTrouves.length > 0) {
            res.status(400).send(`Certains jeux ne peuvent pas être récupérés ou n'existent pas : ${jeuxNonTrouves.join(', ')}`);
            return;
        }
        // Mettre à jour le statut des jeux récupérables
        await Promise.all(jeux.map((jeu) => {
            jeu.statut = 'récupéré';
            return jeu.save();
        }));
        res.status(200).json({
            message: 'Les jeux ont été récupérés avec succès.',
            jeux_recuperes: jeux,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des jeux.');
    }
});
// Route pour que quelqu'un achète un jeu
router.post('/acheter', authenticateToken_1.authenticateToken, authorization_1.isAdminOrManager, [
    (0, express_validator_1.body)('jeux_a_acheter')
        .exists().withMessage('Le champ jeux_a_acheter est requis.')
        .isArray({ min: 1 }).withMessage('Le champ jeux_a_acheter doit être un tableau non vide.')
        .custom((jeux_a_acheter) => jeux_a_acheter.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Chaque jeu_id dans jeux_a_acheter doit être un entier positif.'),
    (0, express_validator_1.body)('code_promo')
        .optional({ nullable: true })
        .isString().withMessage('Le champ code_promo doit être une chaîne de caractères.'),
    (0, express_validator_1.body)('acheteur')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('Le champ acheteur doit être un entier positif.'),
], handleValidationErrors, async (req, res) => {
    const { jeux_a_acheter, code_promo, acheteur } = req.body;
    console.log('--- Début de la route /acheter ---');
    console.log('Utilisateur authentifié :', req.user);
    console.log('Corps de la requête :', req.body);
    try {
        // Vérifier le code promo (si fourni)
        let promo = null;
        let reductionPourcent = 0;
        if (code_promo) {
            console.log('Code promo fourni :', code_promo);
            promo = await codePromotion_1.default.findOne({ where: { libelle: code_promo } });
            console.log('Code promo trouvé :', promo);
            if (!promo) {
                console.log('Code promo invalide.');
                res.status(400).send('Code promo invalide.');
                return;
            }
            reductionPourcent = promo.reductionPourcent;
            console.log('Réduction pourcentage :', reductionPourcent);
        }
        // Vérifier l'existence de l'acheteur (si fourni)
        if (acheteur) {
            console.log('Acheteur fourni :', acheteur);
            const acheteurExist = await acheteur_1.default.findByPk(acheteur);
            console.log('Acheteur trouvé :', acheteurExist);
            if (!acheteurExist) {
                console.log('Acheteur non trouvé.');
                res.status(404).send('Acheteur non trouvé.');
                return;
            }
        }
        // Récupérer les jeux correspondants et vérifier leur statut
        console.log('Jeux à acheter :', jeux_a_acheter);
        const jeux = await jeu_1.default.findAll({
            where: {
                id: jeux_a_acheter,
                statut: 'en vente',
            },
            include: [
                {
                    model: depot_1.default,
                    as: 'depot',
                    include: [
                        {
                            model: vendeur_1.default,
                            as: 'vendeur',
                        },
                    ],
                },
            ],
        });
        console.log('Jeux trouvés :', jeux);
        // Vérifier si tous les jeux à acheter ont été trouvés et sont en vente
        const jeuxIdsTrouves = jeux.map((jeu) => jeu.id);
        console.log('IDs des jeux trouvés :', jeuxIdsTrouves);
        const jeuxNonTrouves = jeux_a_acheter.filter((id) => !jeuxIdsTrouves.includes(id));
        console.log('Jeux non trouvés ou non en vente :', jeuxNonTrouves);
        if (jeuxNonTrouves.length > 0) {
            console.log('Certains jeux ne peuvent pas être achetés ou n\'existent pas.');
            res.status(400).send(`Certains jeux ne peuvent pas être achetés ou n'existent pas : ${jeuxNonTrouves.join(', ')}`);
            return;
        }
        // Récupérer la session active pour calculer la commission
        const today = new Date();
        console.log('Date du jour :', today);
        const session = await session_1.default.findOne({
            where: {
                date_debut: { [sequelize_1.Op.lte]: today },
                date_fin: { [sequelize_1.Op.gte]: today },
            },
        });
        console.log('Session active trouvée :', session);
        if (!session) {
            console.log('Aucune session active trouvée.');
            res.status(404).send('Aucune session active trouvée.');
            return;
        }
        // Préparer un mapping pour accumuler les sommes par vendeur
        const sommeParVendeur = {};
        // Calculer la commission sur chaque jeu
        const achatsPromises = jeux.map(async (jeu) => {
            var _a;
            console.log('Traitement du jeu ID :', jeu.id);
            console.log('Détails du jeu :', jeu.toJSON());
            // Calculer le prix après réduction, si applicable
            const prixApresReduction = promo
                ? jeu.prix - (jeu.prix * reductionPourcent) / 100
                : jeu.prix;
            console.log(`Prix après réduction pour le jeu ${jeu.id} :`, prixApresReduction);
            // Calculer la commission
            const commission = session.commission_en_pourcentage
                ? (prixApresReduction * session.valeur_commission) / 100
                : session.valeur_commission;
            console.log(`Commission pour le jeu ${jeu.id} :`, commission);
            // Montant dû au vendeur
            const montantDuVendeur = prixApresReduction - commission;
            console.log(`Montant dû au vendeur pour le jeu ${jeu.id} :`, montantDuVendeur);
            // Créer l'achat dans la base de données
            const nouvelAchat = await achat_1.default.create({
                jeu_id: jeu.id,
                acheteur_id: acheteur || null,
                date_transaction: today,
                commission: commission,
            });
            console.log(`Achat créé pour le jeu ${jeu.id} :`, nouvelAchat.toJSON());
            // Mettre à jour le statut du jeu à 'vendu'
            jeu.statut = 'vendu';
            await jeu.save();
            console.log(`Statut du jeu ${jeu.id} mis à jour à 'vendu'.`);
            // Récupérer le vendeur via le dépôt
            const vendeur = (_a = jeu.depot) === null || _a === void 0 ? void 0 : _a.vendeur;
            console.log(`Vendeur pour le jeu ${jeu.id} :`, vendeur === null || vendeur === void 0 ? void 0 : vendeur.toJSON());
            if (!vendeur) {
                throw new Error(`Le vendeur pour le jeu ${jeu.id} n'existe pas.`);
            }
            const vendeurId = vendeur.id;
            console.log(`ID du vendeur pour le jeu ${jeu.id} :`, vendeurId);
            // Accumuler les sommes pour chaque vendeur
            if (!sommeParVendeur[vendeurId]) {
                sommeParVendeur[vendeurId] = {
                    sommedue: 0,
                    sommegenerée: 0,
                };
            }
            sommeParVendeur[vendeurId].sommedue += montantDuVendeur;
            sommeParVendeur[vendeurId].sommegenerée += prixApresReduction;
            console.log(`Sommes accumulées pour le vendeur ${vendeurId} :`, sommeParVendeur[vendeurId]);
            return nouvelAchat;
        });
        const achats = await Promise.all(achatsPromises);
        console.log('Achats réalisés :', achats.map(achat => achat.toJSON()));
        // Vérifier que des achats ont été effectués
        if (!achats || achats.length === 0) {
            console.log('Aucun achat n\'a pu être effectué.');
            res.status(400).send('Aucun achat n\'a pu être effectué.');
            return;
        }
        // Mettre à jour ou créer les sommes pour chaque vendeur
        for (const vendeurId in sommeParVendeur) {
            const { sommedue, sommegenerée } = sommeParVendeur[vendeurId];
            console.log(`Mise à jour des sommes pour le vendeur ${vendeurId} :`, sommeParVendeur[vendeurId]);
            // Vérifier si une Somme existe déjà pour ce vendeur et cette session
            let somme = await somme_1.default.findOne({
                where: {
                    utilisateurId: parseInt(vendeurId, 10),
                    sessionId: session.id,
                },
            });
            console.log(`Somme existante pour le vendeur ${vendeurId} et la session ${session.id} :`, somme === null || somme === void 0 ? void 0 : somme.toJSON());
            if (!somme) {
                // Créer une nouvelle Somme
                somme = await somme_1.default.create({
                    utilisateurId: parseInt(vendeurId, 10),
                    sessionId: session.id,
                    sommedue: sommedue,
                    sommegenerée: sommegenerée,
                });
                console.log(`Nouvelle somme créée pour le vendeur ${vendeurId} :`, somme.toJSON());
            }
            else {
                // Convertir les valeurs en nombres avant l'addition
                somme.sommedue = parseFloat(somme.sommedue.toString()) + sommedue;
                somme.sommegenerée = parseFloat(somme.sommegenerée.toString()) + sommegenerée;
                await somme.save();
                console.log(`Somme mise à jour pour le vendeur ${vendeurId} :`, somme.toJSON());
            }
        }
        console.log('--- Fin de la route /acheter ---');
        res.status(201).json({
            message: 'Les jeux ont été achetés avec succès.',
            achats,
        });
    }
    catch (error) {
        console.error('Erreur attrapée dans le bloc catch :', error);
        if (error.message.startsWith('Le vendeur pour le jeu')) {
            res.status(404).send(error.message);
        }
        else {
            res.status(500).send("Erreur lors de l'achat des jeux.");
        }
    }
});
exports.default = router;
