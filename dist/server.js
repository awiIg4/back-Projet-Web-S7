"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)(); // Charger les variables d'environnement
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200', // TODO: Utiliser une variable d'environnement pour l'URL
    credentials: true,
}));
// Importer les routes
const administrateur_1 = __importDefault(require("./routes/administrateur"));
const gestionnaire_1 = __importDefault(require("./routes/gestionnaire"));
const acheteur_1 = __importDefault(require("./routes/acheteur"));
const vendeur_1 = __importDefault(require("./routes/vendeur"));
const licence_1 = __importDefault(require("./routes/licence"));
const editeur_1 = __importDefault(require("./routes/editeur"));
const session_1 = __importDefault(require("./routes/session"));
const codePromotion_1 = __importDefault(require("./routes/codePromotion"));
const stat_1 = __importDefault(require("./routes/stat"));
const jeu_1 = __importDefault(require("./routes/jeu"));
const utilisateur_1 = __importDefault(require("./routes/utilisateur"));
const gestion_1 = __importDefault(require("./routes/gestion"));
// Associer les routes à des chemins spécifiques
app.use('/api/administrateurs', administrateur_1.default);
app.use('/api/gestionnaires', gestionnaire_1.default);
app.use('/api/gestion', gestion_1.default);
app.use('/api/acheteurs', acheteur_1.default);
app.use('/api/vendeurs', vendeur_1.default);
app.use('/api/licences', licence_1.default);
app.use('/api/editeurs', editeur_1.default);
app.use('/api/sessions', session_1.default);
app.use('/api/codesPromotion', codePromotion_1.default);
app.use('/api/stats', stat_1.default);
app.use('/api/jeux', jeu_1.default);
app.use('/api/utilisateurs', utilisateur_1.default);
exports.default = app;
