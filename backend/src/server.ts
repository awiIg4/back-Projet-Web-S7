import express from '../backend/node_modules/@types/express';
import { config } from 'dotenv';
import { connectDB } from './models';
import cookieParser from 'cookie-parser';

config(); // Charger les variables d'environnement

const app = express();
app.use(express.json());
app.use(cookieParser());

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

export default app;