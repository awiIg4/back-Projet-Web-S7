import express from 'express';
import { config } from 'dotenv';
import sequelize from './config/database';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import runSeeder from './scripts/setupDatabase'; // Import du seeder

config(); // Charger les variables d'environnement

const app = express();

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

// Configuration CORS mise à jour
app.use(cors({
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
import administrateurRoutes from './routes/administrateur';
import gestionnaireRoutes from './routes/gestionnaire';
import acheteurRoutes from './routes/acheteur';
import vendeurRoutes from './routes/vendeur';
import licenceRoutes from './routes/licence';
import editeurRoutes from './routes/editeur';
import sessionRoutes from './routes/session';
import codePromotionRoutes from './routes/codePromotion';
import statsRoutes from './routes/stat';
import jeuRoutes from './routes/jeu';
import utilisateurRoutes from './routes/utilisateur';
import gestionRoutes from './routes/gestion';

// Route de test
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.status(200).send('API Root Route - Server is running');
});

// Associer les routes
app.use('/api/administrateurs', administrateurRoutes);
app.use('/api/gestionnaires', gestionnaireRoutes);
app.use('/api/gestion', gestionRoutes);
app.use('/api/acheteurs', acheteurRoutes);
app.use('/api/vendeurs', vendeurRoutes);
app.use('/api/licences', licenceRoutes);
app.use('/api/editeurs', editeurRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/codesPromotion', codePromotionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/jeux', jeuRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

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
    await sequelize.authenticate(); // Vérifie la connexion à la base
    console.log('✅ Database connected.');

    console.log('🌱 Running database seeder...');
    await runSeeder(); // Exécute le seeder
    console.log('✅ Database seeding completed.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;