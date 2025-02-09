import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Licence from './licence';

interface EditeurAttributes {
  id: number;
  nom: string;
}

interface EditeurCreationAttributes extends Omit<EditeurAttributes, 'id'> {}

@Table({
  tableName: 'editeurs',
  timestamps: false,
})
export default class Editeur extends Model<EditeurAttributes, EditeurCreationAttributes> implements EditeurAttributes {
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

  @HasMany(() => Licence, { as: 'licences', foreignKey: 'editeur_id' })
  public licences?: Licence[];
}
