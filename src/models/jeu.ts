import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import Depot from './depot';
import Licence from './licence';

export interface JeuAttributes {
  id: number;
  licence_id: number;
  prix: number;
  statut: string;
  depot_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JeuCreationAttributes extends Omit<JeuAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  tableName: 'jeux',
  timestamps: true,
})
export default class Jeu extends Model<JeuAttributes, JeuCreationAttributes> implements JeuAttributes {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Licence)
  @Column({
    type: DataType.INTEGER,
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
    type: DataType.INTEGER,
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