import Licence from '../models/licence';
import Editeur from '../models/editeur';

export async function importLicences() {
  console.log('📥 Importation des licences depuis la liste statique...');

  // Liste étendue des licences associées à des éditeurs
  const licences = [
    { nom: 'Assassin\'s Creed', editeur_nom: 'Ubisoft' },
    { nom: 'Far Cry', editeur_nom: 'Ubisoft' },
    { nom: 'Watch Dogs', editeur_nom: 'Ubisoft' },
    { nom: 'FIFA', editeur_nom: 'Electronic Arts' },
    { nom: 'Battlefield', editeur_nom: 'Electronic Arts' },
    { nom: 'Zelda', editeur_nom: 'Nintendo' },
    { nom: 'Super Mario', editeur_nom: 'Nintendo' },
    { nom: 'Pokémon', editeur_nom: 'Nintendo' },
    { nom: 'Gran Turismo', editeur_nom: 'Sony Interactive Entertainment' },
    { nom: 'The Last of Us', editeur_nom: 'Sony Interactive Entertainment' },
    { nom: 'Uncharted', editeur_nom: 'Sony Interactive Entertainment' },
    { nom: 'Halo', editeur_nom: 'Microsoft Studios' },
    { nom: 'Forza Motorsport', editeur_nom: 'Microsoft Studios' },
    { nom: 'Gears of War', editeur_nom: 'Microsoft Studios' },
    { nom: 'GTA', editeur_nom: 'Rockstar Games' },
    { nom: 'Red Dead Redemption', editeur_nom: 'Rockstar Games' },
    { nom: 'The Elder Scrolls', editeur_nom: 'Bethesda Softworks' },
    { nom: 'Fallout', editeur_nom: 'Bethesda Softworks' },
    { nom: 'Final Fantasy', editeur_nom: 'Square Enix' },
    { nom: 'Kingdom Hearts', editeur_nom: 'Square Enix' },
    { nom: 'Resident Evil', editeur_nom: 'Capcom' },
    { nom: 'Monster Hunter', editeur_nom: 'Capcom' },
    { nom: 'Metal Gear Solid', editeur_nom: 'Konami' },
    { nom: 'Silent Hill', editeur_nom: 'Konami' },
    { nom: 'Call of Duty', editeur_nom: 'Activision Blizzard' },
    { nom: 'World of Warcraft', editeur_nom: 'Activision Blizzard' },
    { nom: 'Tekken', editeur_nom: 'Bandai Namco' },
    { nom: 'Dark Souls', editeur_nom: 'FromSoftware' },
    { nom: 'Elden Ring', editeur_nom: 'FromSoftware' },
    { nom: 'Half-Life', editeur_nom: 'Valve' },
    { nom: 'Portal', editeur_nom: 'Valve' },
    { nom: 'Counter-Strike', editeur_nom: 'Valve' },
    { nom: 'Fortnite', editeur_nom: 'Epic Games' }
  ];

  for (const licenceData of licences) {
    const editeur = await Editeur.findOne({ where: { nom: licenceData.editeur_nom } });

    if (!editeur) {
      console.error(`❌ Editeur introuvable pour la licence ${licenceData.nom}`);
      continue;
    }

    const [licence, created] = await Licence.findOrCreate({
      where: { nom: licenceData.nom, editeur_id: editeur.id },
      defaults: { nom: licenceData.nom, editeur_id: editeur.id },
    });

    if (created) {
      console.log(`✅ Licence ajoutée : ${licence.nom}`);
    } else {
      console.log(`⚠️ Licence déjà existante : ${licence.nom}`);
    }
  }

  console.log('🎉 Importation des licences terminée.');
}