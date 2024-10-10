import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './utilisateur';

class Vendeur extends Model {
  public id!: number;
}

Vendeur.init({
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
  modelName: 'Vendeur',
  tableName: 'vendeurs',
  timestamps: false,
});

export default Vendeur;