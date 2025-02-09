import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import Licence from '../models/licence';
import Editeur from '../models/editeur';

export async function importLicences() {
  const licencesFile = path.join(__dirname, '../data/licences.csv');

  if (!fs.existsSync(licencesFile)) {
    console.error('❌ Fichier licences.csv introuvable !');
    return;
  }

  console.log('📥 Importation des licences...');

  const licences: { nom: string; editeur_nom: string }[] = [];

  fs.createReadStream(licencesFile)
    .pipe(csvParser())
    .on('data', (row) => {
      licences.push({ nom: row.nom, editeur_nom: row.editeur_nom });
    })
    .on('end', async () => {
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
    });
}