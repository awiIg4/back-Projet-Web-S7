import Administrateur from '../models/administrateur';
import Utilisateur from '../models/utilisateur';
import bcrypt from 'bcrypt';

export async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123';

  // Vérifier si l'utilisateur existe déjà
  let utilisateur = await Utilisateur.findOne({ where: { email } });

  if (!utilisateur) {
    utilisateur = await Utilisateur.create({
      email,
      type_utilisateur: 'administrateur',
    });
  }

  // Vérifier si l'administrateur existe déjà
  let admin = await Administrateur.findOne({ where: { id: utilisateur.id } });

  if (!admin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await Administrateur.create({
      id: utilisateur.id,
      mot_de_passe: hashedPassword
    });

    console.log('✅ Admin created successfully!');
  } else {
    console.log('⚠️ Admin already exists, skipping creation.');
  }
}