import app from './server';
import { connectDB } from './models';

connectDB().then(() => {
  // Démarrer le serveur après la connexion à la base de données
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to the database:', err);
});