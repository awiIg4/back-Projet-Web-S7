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

// Configuration CORS
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
app.set('trust proxy', 1);

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
  console.log('✅ API Root - Server is running');
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
  console.log('⚠️ 404 - Route not found:', req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

// Synchronisation de la base de données
async function setupDatabase() {
  try {
    await sequelize.sync();
    console.log('✅ Database sync complete.');

    console.log('🌱 Running database seeder...');
    await runSeeder();
    console.log('✅ Database seeding completed.');
  } catch (error) {
    console.error('❌ Error during database setup :', error);
    process.exit(1);
  }
}

// Lancer le setup de la base en arrière-plan (évite de bloquer l’exécution du serveur)
setupDatabase();

export default app;