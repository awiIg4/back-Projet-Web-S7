import { Model, Table, Column, DataType, HasOne, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import Administrateur from './administrateur';
import Vendeur from './vendeur';
import Acheteur from './acheteur';

const saltRounds = 10; // Nombre de tours pour le hashage de bcrypt

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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  motdepasse!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refreshToken?: string | null;

  @HasOne(() => Administrateur)
  administrateur!: Administrateur;

  @HasOne(() => Vendeur)
  vendeur!: Vendeur;

  @HasOne(() => Acheteur)
  acheteur!: Acheteur;

  // Hash du mot de passe avant la création
  @BeforeCreate
  static async hashPasswordBeforeCreate(utilisateur: Utilisateur) {
    if (utilisateur.motdepasse) {
      utilisateur.motdepasse = await bcrypt.hash(utilisateur.motdepasse, saltRounds);
    }
  }

  // Hash du mot de passe avant la mise à jour
  @BeforeUpdate
  static async hashPasswordBeforeUpdate(utilisateur: Utilisateur) {
    if (utilisateur.changed('motdepasse')) {
      utilisateur.motdepasse = await bcrypt.hash(utilisateur.motdepasse, saltRounds);
    }
  }
}

export default Utilisateur;