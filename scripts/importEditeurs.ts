import Editeur from '../models/editeur';

export async function importEditeurs() {
  console.log('📥 Importation des éditeurs depuis la liste statique...');

  // Liste étendue des éditeurs
  const editeurs = [
    { nom: 'Ubisoft' },
    { nom: 'Electronic Arts' },
    { nom: 'Nintendo' },
    { nom: 'Sony Interactive Entertainment' },
    { nom: 'Microsoft Studios' },
    { nom: 'Rockstar Games' },
    { nom: 'Bethesda Softworks' },
    { nom: 'Square Enix' },
    { nom: 'Capcom' },
    { nom: 'Konami' },
    { nom: 'Activision Blizzard' },
    { nom: 'Bandai Namco' },
    { nom: 'CD Projekt' },
    { nom: 'SEGA' },
    { nom: '2K Games' },
    { nom: 'FromSoftware' },
    { nom: 'Valve' },
    { nom: 'Epic Games' }
  ];

  for (const editeurData of editeurs) {
    const [editeur, created] = await Editeur.findOrCreate({
      where: { nom: editeurData.nom },
      defaults: editeurData,
    });

    if (created) {
      console.log(`✅ Editeur ajouté : ${editeur.nom}`);
    } else {
      console.log(`⚠️ Editeur déjà existant : ${editeur.nom}`);
    }
  }
}