import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Editeur from './editeur';

class Licence extends Model {
  public id!: number;
  public nom!: string;
  public editeur_id!: number;
}

Licence.init({
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
  editeur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Editeur,
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Licence',
  tableName: 'licences',
  timestamps: false,
});

export default Licence;
