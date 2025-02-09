import Administrateur from '../models/administrateur';
import Utilisateur from '../models/utilisateur';
import bcrypt from 'bcrypt';

export async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123';

  try {
    // Vérifier si l'utilisateur existe déjà
    let utilisateur = await Utilisateur.findOne({ where: { email } });

    if (!utilisateur) {
      utilisateur = await Utilisateur.create({
        email,
        nom: 'Admin',
        telephone: '0000000000',
        adresse: 'Adresse Admin',
        type_utilisateur: 'administrateur',
      });
      console.log('👤 Utilisateur admin créé.');
    } else {
      console.log('⚠️ Utilisateur admin déjà existant.');
    }

    // Vérifier si l'administrateur existe déjà
    let admin = await Administrateur.findOne({ where: { id: utilisateur.id } });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await Administrateur.create({
        id: utilisateur.id,
        mot_de_passe: hashedPassword
      });

      console.log('✅ Administrateur créé avec succès!');
    } else {
      console.log('⚠️ Administrateur déjà existant, création ignorée.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  }
}