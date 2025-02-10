"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importEditeurs = importEditeurs;
const editeur_1 = __importDefault(require("../models/editeur"));
async function importEditeurs() {
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
        const editeurFound = await editeur_1.default.findOne({ where: { nom: editeurData.nom } });
        if (!editeurFound) {
            const editeurCreated = await editeur_1.default.create(editeurData);
            console.log(`✅ Editeur ajouté : ${editeurCreated.nom}`);
        }
        else {
            console.log(`⚠️ Editeur déjà existant : ${editeurFound.nom}`);
        }
    }
}
