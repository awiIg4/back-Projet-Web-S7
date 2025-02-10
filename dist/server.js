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
// Configuration CORS
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:4200',
        'https://awi-86d26c373fe5.herokuapp.com',
        'https://back-projet-web-s7-21ead7148147.herokuapp.com'
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
    console.log('✅ API Root - Server is running');
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
    console.log('⚠️ 404 - Route not found:', req.originalUrl);
    res.status(404).json({ error: 'Route not found' });
});
// Synchronisation de la base de données
async function setupDatabase() {
    try {
        await database_1.default.sync();
        console.log('✅ Database sync complete.');
        console.log('🌱 Running database seeder...');
        console.log('JAIME LE JAMBON BEAUCOUP BEAUCOUP BEAUCOUP CA FAIT CHIER DE FOUUUUUU');
        await (0, setupDatabase_1.default)();
        console.log('✅ Database seeding completed.');
    }
    catch (error) {
        console.error('❌ Error during database setup :', error);
        process.exit(1);
    }
}
// Lancer le setup de la base en arrière-plan (évite de bloquer l’exécution du serveur)
setupDatabase();
exports.default = app;
