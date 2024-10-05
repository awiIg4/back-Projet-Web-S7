import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table
class Information extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pourcentageCommission!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  pourcentageFraisDepot!: number;
}

export default Information;