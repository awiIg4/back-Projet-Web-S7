import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Vendeur from './vendeur';
import Jeu from './jeu';
import Session from './session';

interface DepotAttributes {
  id: number;
  vendeur_id: number;
  session_id: number;
  frais_depot: number;
  date_depot: Date;
}

interface DepotCreationAttributes extends Optional<DepotAttributes, 'id'> {}

class Depot extends Model<DepotAttributes, DepotCreationAttributes> implements DepotAttributes {
  public id!: number;
  public vendeur_id!: number;
  public session_id!: number;
  public frais_depot!: number;
  public date_depot!: Date;

  // Associations
  public vendeur?: Vendeur;
  public session?: Session;
  public jeux?: Jeu[];

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Depot.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    vendeur_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Vendeur,
        key: 'id',
      },
    },
    session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Session,
        key: 'id',
      },
    },
    frais_depot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    date_depot: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'depots',
    timestamps: false, // Désactive les timestamps si vous n'en avez pas besoin
  }
);

// Associations
Depot.belongsTo(Vendeur, { as: 'vendeur', foreignKey: 'vendeur_id' });
Depot.belongsTo(Session, { as: 'session', foreignKey: 'session_id' });
Depot.hasMany(Jeu, { as: 'jeux', foreignKey: 'depot_id' });

export default Depot;