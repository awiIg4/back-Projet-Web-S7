import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import Editeur from '../models/editeur';

export async function importEditeurs() {
  const editeursFile = path.join(__dirname, '../data/editeurs.csv');

  if (!fs.existsSync(editeursFile)) {
    console.error('❌ Fichier editeurs.csv introuvable !');
    return;
  }

  console.log('📥 Importation des éditeurs...');

  const editeurs: { nom: string }[] = [];

  fs.createReadStream(editeursFile)
    .pipe(csvParser())
    .on('data', (row) => {
      editeurs.push({ nom: row.nom });
    })
    .on('end', async () => {
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

      console.log('🎉 Importation des éditeurs terminée.');
    });
}