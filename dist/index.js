"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const models_1 = require("./models");
(0, models_1.connectDB)().then(() => {
    // Démarrer le serveur après la connexion à la base de données
    const PORT = process.env.PORT || 8000;
    server_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to the database:', err);
});
