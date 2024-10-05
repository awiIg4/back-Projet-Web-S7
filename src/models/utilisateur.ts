import { Model, Table, Column, DataType, HasOne } from 'sequelize-typescript';
import Administrateur from './administrateur';
import Vendeur from './vendeur';
import Acheteur from './acheteur';

@Table
class Utilisateur extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nom!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  telephone!: string;

  @Column({
    type: DataType.STRING,
  })
  adresse!: string;

  @Column({
    type: DataType.ENUM('administrateur', 'vendeur', 'acheteur'),
    allowNull: false,
  })
  typeUtilisateur!: string;

  @HasOne(() => Administrateur)
  administrateur!: Administrateur;

  @HasOne(() => Vendeur)
  vendeur!: Vendeur;

  @HasOne(() => Acheteur)
  acheteur!: Acheteur;
}

export default Utilisateur;