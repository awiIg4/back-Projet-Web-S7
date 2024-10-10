import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Editeur extends Model {
  public id!: number;
  public nom!: string;
}

Editeur.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Editeur',
  tableName: 'editeurs',
  timestamps: false,
});

export default Editeur;