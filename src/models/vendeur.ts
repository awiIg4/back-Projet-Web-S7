// src/models/vendeur.ts

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Utilisateur from './utilisateur';

export interface VendeurAttributes {
  id: number;
}

export interface VendeurCreationAttributes extends VendeurAttributes {}

@Table({
  tableName: 'vendeurs',
  timestamps: false,
})
export default class Vendeur extends Model<VendeurAttributes, VendeurCreationAttributes> implements VendeurAttributes {
  @ForeignKey(() => Utilisateur)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  public id!: number;

  @BelongsTo(() => Utilisateur)
  public utilisateur?: Utilisateur;
}