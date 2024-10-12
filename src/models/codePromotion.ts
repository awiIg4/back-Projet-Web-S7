// src/models/codePromotion.ts

import { Table, Column, Model, DataType } from 'sequelize-typescript';

export interface CodePromotionAttributes {
  libelle: string;
  reductionPourcent: number;
}

export interface CodePromotionCreationAttributes extends CodePromotionAttributes {}

@Table({
  tableName: 'code_promotion',
  timestamps: false,
})
export default class CodePromotion extends Model<CodePromotionAttributes, CodePromotionCreationAttributes> implements CodePromotionAttributes {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  public libelle!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public reductionPourcent!: number;
}