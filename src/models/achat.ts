import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Jeu from './jeu';
import Acheteur from './acheteur';
import CodePromotion from './codePromotion';

export interface AchatAttributes {
  id: number;
  jeu_id: number;
  acheteur_id: number;
  date_transaction: Date;
  commission: number;
  codePromotionLibele?: string;
}

export interface AchatCreationAttributes extends Omit<AchatAttributes, 'id'> {}

@Table({
  tableName: 'achats',
  timestamps: false,
})
export default class Achat extends Model<AchatAttributes, AchatCreationAttributes> implements AchatAttributes {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Jeu)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public jeu_id!: number;

  @BelongsTo(() => Jeu)
  public jeu?: Jeu;

  @ForeignKey(() => Acheteur)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public acheteur_id!: number;

  @BelongsTo(() => Acheteur)
  public acheteur?: Acheteur;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public date_transaction!: Date;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  public commission!: number;

  @ForeignKey(() => CodePromotion)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public codePromotionLibele?: string;

  @BelongsTo(() => CodePromotion)
  public codePromotion?: CodePromotion;
}