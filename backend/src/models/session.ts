import { Table, Column, Model, DataType } from 'sequelize-typescript';

interface SessionAttributes {
  id: number;
  date_debut: Date;
  date_fin: Date;
  valeur_commission: number;
  commission_en_pourcentage: boolean;
  valeur_frais_depot: number;
  frais_depot_en_pourcentage: boolean;
}

interface SessionCreationAttributes extends Omit<SessionAttributes, 'id'> {}

@Table({
  tableName: 'sessions',
  timestamps: false,
})
export default class Session extends Model<SessionAttributes, SessionCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public date_debut!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public date_fin!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public valeur_commission!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true = en pourcentage, false = en valeur',
  })
  public commission_en_pourcentage!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public valeur_frais_depot!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true = en pourcentage, false = en valeur',
  })
  public frais_depot_en_pourcentage!: boolean;
}
