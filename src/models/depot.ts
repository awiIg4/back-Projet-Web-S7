import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Vendeur from './vendeur';
import Jeu from './jeu';
import Session from './session';

class Depot extends Model {
  public id!: number;
  public vendeur_id!: number;
  public jeu_id!: number[];
  public session_id!: number;
  public frais_depot!: number;
  public date_depot!: Date;
}

Depot.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  vendeur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendeur,
      key: 'id',
    },
  },
  jeu_id: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Session,
      key: 'id',
    },
  },
  frais_depot: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  date_depot: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Depot',
  tableName: 'depots',
  timestamps: false,
});

export default Depot;