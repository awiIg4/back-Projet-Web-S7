import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';
import Depot from './depot';

@Table
class Session extends Model {
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  dateDebut!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  dateFin!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  estActif!: boolean;

  @HasMany(() => Depot)
  depots!: Depot[];
}

export default Session;