import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './utilisateur';
import Depot from './depot'

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

// Associations
Vendeur.hasMany(Depot, { as: 'depots', foreignKey: 'vendeur_id' });

export default Vendeur;