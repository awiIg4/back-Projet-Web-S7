import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Jeu from './jeu';
import Acheteur from './acheteur';

class Achat extends Model {
  public id!: number;
  public jeu_id!: number;
  public acheteur_id!: number;
  public date_transaction!: Date;
  public commission!: number;
}

Achat.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  jeu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Jeu,
      key: 'id',
    },
  },
  acheteur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Acheteur,
      key: 'id',
    },
  },
  date_transaction: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  commission: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Achat',
  tableName: 'achats',
  timestamps: false,
});

export default Achat;