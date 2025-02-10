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
    const editeurFound = await Editeur.findOne({ where: { nom: editeurData.nom } });
    if (!editeurFound) {
      const editeurCreated = await Editeur.create(editeurData);
      console.log(`✅ Editeur ajouté : ${editeurCreated.nom}`);
    } else {
      console.log(`⚠️ Editeur déjà existant : ${editeurFound.nom}`);
    }
  }
}