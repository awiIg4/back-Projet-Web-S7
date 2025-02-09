"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importEditeurs = importEditeurs;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const editeur_1 = __importDefault(require("../models/editeur"));
async function importEditeurs() {
    const editeursFile = path_1.default.join(__dirname, '../data/editeurs.csv');
    if (!fs_1.default.existsSync(editeursFile)) {
        console.log(`📂 Chemin du fichier attendu : ${editeursFile}`);
        console.error('❌ Fichier editeurs.csv introuvable !');
        return;
    }
    console.log('📥 Importation des éditeurs...');
    const editeurs = [];
    fs_1.default.createReadStream(editeursFile)
        .pipe((0, csv_parser_1.default)())
        .on('data', (row) => {
        editeurs.push({ nom: row.nom });
    })
        .on('end', async () => {
        for (const editeurData of editeurs) {
            const [editeur, created] = await editeur_1.default.findOrCreate({
                where: { nom: editeurData.nom },
                defaults: editeurData,
            });
            if (created) {
                console.log(`✅ Editeur ajouté : ${editeur.nom}`);
            }
            else {
                console.log(`⚠️ Editeur déjà existant : ${editeur.nom}`);
            }
        }
        console.log('🎉 Importation des éditeurs terminée.');
    });
}
