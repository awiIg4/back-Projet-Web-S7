import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Editeur from './editeur';

interface LicenceAttributes {
  id: number;
  nom: string;
  editeur_id: number;
}

interface LicenceCreationAttributes extends Omit<LicenceAttributes, 'id'> {}

@Table({
  tableName: 'licences',
  timestamps: false,
})
export default class Licence extends Model<LicenceAttributes, LicenceCreationAttributes> implements LicenceAttributes {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public nom!: string;

  @ForeignKey(() => Editeur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public editeur_id!: number;

  @BelongsTo(() => Editeur, { as: 'editeur' })
  public editeur?: Editeur;
}