"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const vendeur_1 = __importDefault(require("../models/vendeur"));
const acheteur_1 = __importDefault(require("../models/acheteur"));
const licence_1 = __importDefault(require("../models/licence"));
const editeur_1 = __importDefault(require("../models/editeur"));
const jeu_1 = __importDefault(require("../models/jeu"));
const depot_1 = __importDefault(require("../models/depot"));
const session_1 = __importDefault(require("../models/session"));
const somme_1 = __importDefault(require("../models/somme"));
const administrateur_1 = __importDefault(require("../models/administrateur"));
const achat_1 = __importDefault(require("../models/achat"));
const codePromotion_1 = __importDefault(require("../models/codePromotion"));
// Liste des modèles
const models = [
    utilisateur_1.default,
    vendeur_1.default,
    acheteur_1.default,
    licence_1.default,
    editeur_1.default,
    jeu_1.default,
    depot_1.default,
    session_1.default,
    somme_1.default,
    administrateur_1.default,
    achat_1.default,
    codePromotion_1.default,
];
// 1) Cas "production" ou Heroku : si DATABASE_URL est présent
// 2) Sinon, on prend les variables DB_HOST/DB_USER/etc. pour le dev/test
const useDatabaseURL = !!process.env.DATABASE_URL;
let sequelize;
const dbConfig = {
    production: {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
    // ... autres configurations
};
if (useDatabaseURL) {
    // Sur Heroku, Sequelize sait décortiquer le "postgres://..."
    // On peut ajouter ssl si nécessaire
    sequelize = new sequelize_typescript_1.Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        models,
        logging: false,
        // Sur Heroku, souvent ssl
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    });
}
else {
    // En dev/test local
    sequelize = new sequelize_typescript_1.Sequelize({
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: 'postgres',
        models,
        logging: false,
    });
}
exports.default = sequelize;
