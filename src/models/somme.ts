import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Utilisateur from './utilisateur';
import Session from './session';

// Définir et exporter les interfaces des attributs
export interface SommeAttributes {
  id: number;
  utilisateurId: number;
  sessionId: number;
  sommedue: number;
  sommegenerée: number;
}

export interface SommeCreationAttributes extends Omit<SommeAttributes, 'id'> {}

// Définir le modèle avec les interfaces
@Table({
  tableName: 'sommes',
  timestamps: false,
})
export default class Somme extends Model<SommeAttributes, SommeCreationAttributes> implements SommeAttributes {
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