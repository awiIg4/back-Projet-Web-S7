import { Model, Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Vendeur from './vendeur';
import Jeu from './jeu';
import Session from './session';

@Table
class Depot extends Model {
  @ForeignKey(() => Vendeur)
  @Column({
    type: DataType.INTEGER,  // Correction ici
    allowNull: false,
  })
  vendeurId!: number;

  @ForeignKey(() => Session)
  @Column({
    type: DataType.INTEGER,  // Correction ici
    allowNull: false,
  })
  sessionId!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  fraisDepot!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  dateDepot!: Date;

  @BelongsTo(() => Vendeur)
  vendeur!: Vendeur;

  @BelongsTo(() => Session)
  session!: Session;

  @HasMany(() => Jeu)
  jeux!: Jeu[];
}

export default Depot;