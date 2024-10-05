import { Model, Table, Column, DataType, ForeignKey, HasMany } from 'sequelize-typescript';
import Utilisateur from './utilisateur';
import Achat from './achat';

@Table
class Acheteur extends Model {
  @ForeignKey(() => Utilisateur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;

  @HasMany(() => Achat)
  achats!: Achat[];
}

export default Acheteur;
