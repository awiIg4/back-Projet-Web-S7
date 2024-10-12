import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Utilisateur from './utilisateur';
import Session from './session';

@Table({
  tableName: 'sommes',
  timestamps: false,
})
export default class Somme extends Model<Somme> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Utilisateur)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public utilisateurId!: number;

  @BelongsTo(() => Utilisateur)
  public utilisateur?: Utilisateur;

  @ForeignKey(() => Session)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public sessionId!: number;

  @BelongsTo(() => Session)
  public session?: Session;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  public sommedue!: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  public sommegenerée!: number;
}
