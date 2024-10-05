import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Jeu from './jeu';
import Vendeur from './vendeur';
import Acheteur from './acheteur';
import CodePromotion from './codePromotion';

@Table
class Achat extends Model {
  @ForeignKey(() => Jeu)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  jeuId!: number;

  @ForeignKey(() => Vendeur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vendeurId!: number;

  @ForeignKey(() => Acheteur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  acheteurId!: number;

  @ForeignKey(() => CodePromotion)
  @Column({
    type: DataType.STRING,  // Correction ici
    allowNull: false,
  })
  codepromotion!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  dateTransaction!: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  montant!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  commission!: number;

  @BelongsTo(() => Jeu)
  jeu!: Jeu;

  @BelongsTo(() => Vendeur)
  vendeur!: Vendeur;

  @BelongsTo(() => Acheteur)
  acheteur!: Acheteur;

  @BelongsTo(() => CodePromotion)
  codePromotion!: CodePromotion;
}

export default Achat;