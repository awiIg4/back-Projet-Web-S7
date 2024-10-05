import { Model, Table, Column, DataType, ForeignKey } from 'sequelize-typescript';
import Utilisateur from './utilisateur';

@Table
class Administrateur extends Model {
  @ForeignKey(() => Utilisateur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;
}

export default Administrateur;
