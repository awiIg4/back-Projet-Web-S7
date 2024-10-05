"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.Acheteur = exports.Vendeur = exports.Administrateur = exports.Utilisateur = void 0;
const database_1 = __importDefault(require("../config/database"));
const utilisateur_1 = __importDefault(require("./utilisateur"));
exports.Utilisateur = utilisateur_1.default;
const administrateur_1 = __importDefault(require("./administrateur"));
exports.Administrateur = administrateur_1.default;
const vendeur_1 = __importDefault(require("./vendeur"));
exports.Vendeur = vendeur_1.default;
const acheteur_1 = __importDefault(require("./acheteur"));
exports.Acheteur = acheteur_1.default;
const connectDB = async () => {
    try {
        await database_1.default.authenticate();
        console.log('Database connected...');
        await database_1.default.sync({ alter: true });
    }
    catch (err) {
        console.error('Unable to connect to the database:', err);
    }
};
exports.connectDB = connectDB;
