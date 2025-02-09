import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './models';
import cookieParser from 'cookie-parser';
import cors from 'cors';


config(); // Charger les variables d'environnement

const app = express();

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: '*', // Temporairement accepter toutes les origines
    credentials: true,
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

// Route de test tout en haut
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.status(200).send('API Root Route - Server is running');
});

app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.status(200).send('API Test Route');
});

// Associer les routes à des chemins spécifiques
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

// Route 404 pour les chemins non trouvés
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

export default app;