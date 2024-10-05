import { Sequelize } from 'sequelize-typescript';
import { config } from 'dotenv';

config(); // Charger les variables d'environnement

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  models: [__dirname + '/../models'] // Chargement automatique des modèles
});

export default sequelize;