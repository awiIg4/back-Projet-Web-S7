import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Jeu extends Model {
  public id!: number;
  public licence_id!: number;
  public prix!: number;
  public statut!: string;
}

Jeu.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  licence_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prix: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "en vente, vendu, récupérable, récupéré",
  },
}, {
  sequelize,
  modelName: 'Jeu',
  tableName: 'jeux',
  timestamps: false,
});

export default Jeu;
