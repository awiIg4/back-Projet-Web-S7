import { Table, Column, Model, DataType, ForeignKey, HasMany } from 'sequelize-typescript';
import Utilisateur from './utilisateur';
import Achat from './achat';

interface AcheteurAttributes {
  id: number;
}

interface AcheteurCreationAttributes extends AcheteurAttributes {}

@Table({
  tableName: 'acheteurs',
  timestamps: false,
})
export default class Acheteur extends Model<AcheteurAttributes, AcheteurCreationAttributes> implements AcheteurAttributes {
  @ForeignKey(() => Utilisateur)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  public id!: number;

  @HasMany(() => Achat, { as: 'achats', foreignKey: 'acheteur_id' })
  public achats?: Achat[];
}
