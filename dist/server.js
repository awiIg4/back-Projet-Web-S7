"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const database_1 = __importDefault(require("./config/database"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const setupDatabase_1 = __importDefault(require("./scripts/setupDatabase")); // Import du seeder
(0, dotenv_1.config)(); // Charger les variables d'environnement
const app = (0, express_1.default)();
// Middleware de logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Configuration CORS mise à jour
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:4200', // Pour le développement local
        'https://awi-86d26c373fe5.herokuapp.com', // Frontend sur Heroku
        'https://back-projet-web-s7-21ead7148147.herokuapp.com' // Backend sur Heroku
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
// Route de test
app.get('/', (req, res) => {
    console.log('Root route hit');
    res.status(200).send('API Root Route - Server is running');
});
// Associer les routes
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
// Route 404
app.use('*', (req, res) => {
    console.log('404 - Route not found:', req.originalUrl);
    res.status(404).json({ error: 'Route not found' });
});
// Démarrage du serveur avec connexion à la base et exécution du seeder
const PORT = Number(process.env.PORT) || 8000;
const startServer = async () => {
    try {
        console.log('🔄 Connecting to database...');
        await database_1.default.authenticate(); // Vérifie la connexion à la base
        console.log('✅ Database connected.');
        console.log('🌱 Running database seeder...');
        await (0, setupDatabase_1.default)(); // Exécute le seeder
        console.log('✅ Database seeding completed.');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1); // Quitte l'application en cas d'erreur
    }
};
startServer();
exports.default = app;
