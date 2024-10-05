import express from 'express';
import { connectDB } from './models';

const app = express();
app.use(express.json());

// Connecte la base de données
connectDB();

// Démarre le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});