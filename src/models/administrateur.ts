import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Utilisateur from './utilisateur';

interface AdministrateurAttributes {
  id: number;
  mot_de_passe: string;
}

interface AdministrateurCreationAttributes extends AdministrateurAttributes {}

@Table({
  tableName: 'administrateurs',
  timestamps: false,
})
export default class Administrateur
  extends Model<AdministrateurAttributes, AdministrateurCreationAttributes>
  implements AdministrateurAttributes
{
  @ForeignKey(() => Utilisateur)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  public id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  public mot_de_passe!: string;

  @BelongsTo(() => Utilisateur)
  public utilisateur?: Utilisateur;
}
