import { Model, Table, Column, DataType, ForeignKey, HasMany } from 'sequelize-typescript';
import Utilisateur from './utilisateur';
import Depot from './depot';
import Achat from './achat';

@Table
class Vendeur extends Model {
  @ForeignKey(() => Utilisateur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;

  @HasMany(() => Depot)
  depots!: Depot[];

  @HasMany(() => Achat)
  achats!: Achat[];
}

export default Vendeur;
