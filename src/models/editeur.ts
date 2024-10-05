import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';
import Jeu from './jeu';

@Table
class Editeur extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nom!: string;

  @Column(DataType.STRING)
  adresse!: string;

  @Column(DataType.STRING)
  contact!: string;

  @HasMany(() => Jeu)
  jeux!: Jeu[];
}

export default Editeur;