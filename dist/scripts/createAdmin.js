"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = createAdmin;
const administrateur_1 = __importDefault(require("../models/administrateur"));
const utilisateur_1 = __importDefault(require("../models/utilisateur"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function createAdmin() {
    const email = 'admin@example.com';
    const password = 'admin123';
    try {
        // Vérifier si l'utilisateur existe déjà
        let utilisateur = await utilisateur_1.default.findOne({ where: { email } });
        if (!utilisateur) {
            utilisateur = await utilisateur_1.default.create({
                email,
                nom: 'Admin',
                telephone: '0000000000',
                adresse: 'Adresse Admin',
                type_utilisateur: 'administrateur',
            });
            console.log('👤 Utilisateur admin créé.');
        }
        else {
            console.log('⚠️ Utilisateur admin déjà existant.');
        }
        // Vérifier si l'administrateur existe déjà
        let admin = await administrateur_1.default.findOne({ where: { id: utilisateur.id } });
        if (!admin) {
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            await administrateur_1.default.create({
                id: utilisateur.id,
                mot_de_passe: hashedPassword
            });
            console.log('✅ Administrateur créé avec succès!');
        }
        else {
            console.log('⚠️ Administrateur déjà existant, création ignorée.');
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    }
}
