import sequelize from '../config/database';
import Utilisateur from './utilisateur';
import Administrateur from './administrateur';
import Vendeur from './vendeur';
import Acheteur from './acheteur';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

export { Utilisateur, Administrateur, Vendeur, Acheteur, connectDB };
