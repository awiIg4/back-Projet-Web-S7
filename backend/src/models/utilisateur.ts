import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface UtilisateurAttributes {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  adresse?: string;
  type_utilisateur: string;
}

interface UtilisateurCreationAttributes extends Optional<UtilisateurAttributes, 'id'> {}

@Table({ tableName: 'utilisateurs', timestamps: false })
export default class Utilisateur extends Model<UtilisateurAttributes, UtilisateurCreationAttributes> implements UtilisateurAttributes {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  public id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  public nom!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  public email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  public telephone!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  public adresse?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  public type_utilisateur!: string;
}
