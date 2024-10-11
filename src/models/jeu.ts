import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Depot from './depot';
import Licence from './licence';

interface JeuAttributes {
  id: number;
  licence_id: number;
  prix: number;
  statut: string;
  depot_id: number;
  createdAt?: Date; // Add this line
  updatedAt?: Date; // Add this line
}

interface JeuCreationAttributes extends Optional<JeuAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Jeu extends Model<JeuAttributes, JeuCreationAttributes> implements JeuAttributes {
  public id!: number;
  public licence_id!: number;
  public prix!: number;
  public statut!: string;
  public depot_id!: number;

  public readonly createdAt!: Date; // Add this line
  public readonly updatedAt!: Date; // Add this line

  // Associations
  public depot?: Depot;
  public licence?: Licence;
}

Jeu.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    licence_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Licence,
        key: 'id',
      },
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    statut: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    depot_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Depot,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'jeux',
    timestamps: true, // Ensure timestamps are enabled
  }
);

// Associations
Jeu.belongsTo(Depot, { as: 'depot', foreignKey: 'depot_id' });
Jeu.belongsTo(Licence, { as: 'licence', foreignKey: 'licence_id' });

export default Jeu;