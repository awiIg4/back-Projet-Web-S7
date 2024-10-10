import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Session extends Model {
  public id!: number;
  public date_debut!: Date;
  public date_fin!: Date;
  public valeur_commission!: number;
  public commission_en_pourcentage!: boolean;
  public valeur_frais_depot!: number;
  public frais_depot_en_pourcentage!: boolean;
}

Session.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  valeur_commission: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  commission_en_pourcentage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true = en pourcentage, false = en valeur',
  },
  valeur_frais_depot: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  frais_depot_en_pourcentage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true = en pourcentage, false = en valeur',
  },
}, {
  sequelize,
  modelName: 'Session',
  tableName: 'sessions',
  timestamps: false,
});

export default Session;
