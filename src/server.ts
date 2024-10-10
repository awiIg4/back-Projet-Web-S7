import express from 'express';
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


// Associer les routes à des chemins spécifiques
app.use('/api/administrateurs', administrateurRoutes);
app.use('/api/gestionnaires', gestionnaireRoutes);
app.use('/api/acheteurs', acheteurRoutes);
app.use('/api/vendeurs', vendeurRoutes);
app.use('/api/licences', licenceRoutes); 
app.use('/api/editeurs', editeurRoutes); 
app.use('/api/session', sessionRoutes); 
app.use('/api/codePromotion', codePromotionRoutes); 


// Connexion à la base de données
connectDB();

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});