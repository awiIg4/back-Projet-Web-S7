"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv"); // Pour charger les variables d'environnement
const models_1 = require("./models"); // Ta fonction de connexion à la base de données
// Charger les variables d'environnement depuis le fichier .env
(0, dotenv_1.config)();
// Créer une instance de l'application Express
const app = (0, express_1.default)();
// Middleware pour parser le JSON dans les requêtes
app.use(express_1.default.json());
// Appeler la fonction pour se connecter à la base de données
(0, models_1.connectDB)();
// Exemple de route (tu peux ajouter plus de routes dans un fichier routes séparé)
app.get('/', (req, res) => {
    res.send('API is running...');
});
// Définir le port (prend le port de .env ou 5000 par défaut)
const PORT = process.env.PORT || 5000;
// Démarrer le serveur sur le port défini
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
