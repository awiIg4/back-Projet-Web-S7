import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Utilisateur extends Model {
  public id!: number;
  public nom!: string;
  public email!: string;
  public telephone!: string;
  public adresse?: string;
  public type_utilisateur!: string;
}

Utilisateur.init({
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
  },
  type_utilisateur: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "administrateur, gestionnaire, vendeur, acheteur",
  },
}, {
  sequelize,
  modelName: 'Utilisateur',
  tableName: 'utilisateurs',
  timestamps: false,
});

export default Utilisateur;