import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import Depot from './depot';
import Licence from './licence';

@Table({
  tableName: 'jeux',
  timestamps: true,
})
export default class Jeu extends Model<Jeu> {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  })
  public id!: number;

  @ForeignKey(() => Licence)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
  })
  public licence_id!: number;

  @BelongsTo(() => Licence, { as: 'licence' })
  public licence?: Licence;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  public prix!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  public statut!: string;

  @ForeignKey(() => Depot)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
  })
  public depot_id!: number;

  @BelongsTo(() => Depot, { as: 'depot' })
  public depot?: Depot;

  @CreatedAt
  public readonly createdAt!: Date;

  @UpdatedAt
  public readonly updatedAt!: Date;
}
