import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Utilisateur from './utilisateur';
import Session from './session';

class Somme extends Model {
  public id!: number;
  public utilisateurId!: number;
  public sessionId!: number;
  public sommedue!: number;
  public sommegenerée!: number;
}

Somme.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Utilisateur,
      key: 'id',
    },
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Session,
      key: 'id',
    },
  },
  sommedue: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  sommegenerée: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Somme',
  tableName: 'sommes',
  timestamps: false,
});

export default Somme;