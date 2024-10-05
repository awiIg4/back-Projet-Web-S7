import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './models';

// Charger les variables d'environnement
config();

const app = express();
app.use(express.json());  // Middleware pour parser les requêtes au format JSON

// Importer les routes
import utilisateurRoutes from './routes/utilisateur';
import administrateurRoutes from './routes/administrateur';
import vendeurRoutes from './routes/vendeur';
import acheteurRoutes from './routes/acheteur';
import jeuRoutes from './routes/jeu';
import editeurRoutes from './routes/editeur';
import achatRoutes from './routes/achat';
import sessionRoutes from './routes/session';
import depotRoutes from './routes/depot';

// Associer les routes à des chemins spécifiques
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/administrateurs', administrateurRoutes);
app.use('/api/vendeurs', vendeurRoutes);
app.use('/api/acheteurs', acheteurRoutes);
app.use('/api/jeux', jeuRoutes);
app.use('/api/editeurs', editeurRoutes);
app.use('/api/achats', achatRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/depots', depotRoutes);

// Connexion à la base de données
connectDB();

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});