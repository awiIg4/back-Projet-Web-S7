"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importLicences = importLicences;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const licence_1 = __importDefault(require("../models/licence"));
const editeur_1 = __importDefault(require("../models/editeur"));
async function importLicences() {
    const licencesFile = path_1.default.join(__dirname, '../data/licences.csv');
    if (!fs_1.default.existsSync(licencesFile)) {
        console.error('❌ Fichier licences.csv introuvable !');
        return;
    }
    console.log('📥 Importation des licences...');
    const licences = [];
    fs_1.default.createReadStream(licencesFile)
        .pipe((0, csv_parser_1.default)())
        .on('data', (row) => {
        licences.push({ nom: row.nom, editeur_nom: row.editeur_nom });
    })
        .on('end', async () => {
        for (const licenceData of licences) {
            const editeur = await editeur_1.default.findOne({ where: { nom: licenceData.editeur_nom } });
            if (!editeur) {
                console.error(`❌ Editeur introuvable pour la licence ${licenceData.nom}`);
                continue;
            }
            const [licence, created] = await licence_1.default.findOrCreate({
                where: { nom: licenceData.nom, editeur_id: editeur.id },
                defaults: { nom: licenceData.nom, editeur_id: editeur.id },
            });
            if (created) {
                console.log(`✅ Licence ajoutée : ${licence.nom}`);
            }
            else {
                console.log(`⚠️ Licence déjà existante : ${licence.nom}`);
            }
        }
        console.log('🎉 Importation des licences terminée.');
    });
}
