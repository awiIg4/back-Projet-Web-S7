import { Sequelize } from 'sequelize-typescript';
import { config } from 'dotenv';
config();

import Utilisateur from '../models/utilisateur';
import Vendeur from '../models/vendeur';
import Acheteur from '../models/acheteur';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import Jeu from '../models/jeu';
import Depot from '../models/depot';
import Session from '../models/session';
import Somme from '../models/somme';
import Administrateur from '../models/administrateur';
import Achat from '../models/achat';
import CodePromotion from '../models/codePromotion';

// Liste des modèles
const models = [
  Utilisateur,
  Vendeur,
  Acheteur,
  Licence,
  Editeur,
  Jeu,
  Depot,
  Session,
  Somme,
  Administrateur,
  Achat,
  CodePromotion,
];

// 1) Cas "production" ou Heroku : si DATABASE_URL est présent
// 2) Sinon, on prend les variables DB_HOST/DB_USER/etc. pour le dev/test
const useDatabaseURL = !!process.env.DATABASE_URL;

let sequelize: Sequelize;

const dbConfig = {
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
  // ... autres configurations
};

if (useDatabaseURL) {
  // Sur Heroku, Sequelize sait décortiquer le "postgres://..."
  // On peut ajouter ssl si nécessaire
  sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    dialect: 'postgres',
    models,
    logging: false,
    // Sur Heroku, souvent ssl
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // En dev/test local
  sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    models,
    logging: false,
  });
}

export default sequelize;