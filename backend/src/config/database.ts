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

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  models: [
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
  ],
  logging: false,
});

export default sequelize;
