import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './utilisateur';

class Acheteur extends Model {
  public id!: number;
}

Acheteur.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Utilisateur,
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Acheteur',
  tableName: 'acheteurs',
  timestamps: false,
});

export default Acheteur;
