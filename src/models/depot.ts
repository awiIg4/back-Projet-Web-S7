import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany} from 'sequelize-typescript';
import Vendeur from './vendeur';
import Jeu from './jeu';
import Session from './session';

interface DepotAttributes {
  id: number;
  vendeur_id: number;
  session_id: number;
  frais_depot: number;
  date_depot: Date;
}

interface DepotCreationAttributes extends Omit<DepotAttributes, 'id'> {}

@Table({
  tableName: 'depots',
  timestamps: false,
})
export default class Depot extends Model<DepotAttributes, DepotCreationAttributes> implements DepotAttributes {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  public id!: number;

  @ForeignKey(() => Vendeur)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
  })
  public vendeur_id!: number;

  @BelongsTo(() => Vendeur, { as: 'vendeur' })
  public vendeur?: Vendeur;

  @ForeignKey(() => Session)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
  })
  public session_id!: number;

  @BelongsTo(() => Session, { as: 'session' })
  public session?: Session;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  public frais_depot!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public date_depot!: Date;

  @HasMany(() => Jeu, { as: 'jeux', foreignKey: 'depot_id' })
  public jeux?: Jeu[];
}
