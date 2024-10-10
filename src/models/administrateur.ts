import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './utilisateur';

class Administrateur extends Model {
  public id!: number;
  public mot_de_passe!: string;
}

Administrateur.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Utilisateur,
      key: 'id',
    },
  },
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Administrateur',
  tableName: 'administrateurs',
  timestamps: false,
});

export default Administrateur;
