import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'sessions',
  timestamps: false,
})
export default class Session extends Model<Session> {
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
