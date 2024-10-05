import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Editeur from './editeur';

@Table
class Jeu extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nom!: string;

  @ForeignKey(() => Editeur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  editeurId!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  prix!: number;

  @Column({
    type: DataType.ENUM('en vente', 'vendu'),
    allowNull: false,
  })
  statut!: string;

  @BelongsTo(() => Editeur)
  editeur!: Editeur;
}

export default Jeu;