import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';
import Achat from './achat';

@Table
class CodePromotion extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  })
  libele!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  reductionPourcent!: number;

  @HasMany(() => Achat)
  achats!: Achat[];
}

export default CodePromotion;