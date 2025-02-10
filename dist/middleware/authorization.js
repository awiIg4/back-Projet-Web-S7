"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminOrManager = isAdminOrManager;
exports.isAdministrateur = isAdministrateur;
exports.isGestionnaire = isGestionnaire;
// Middleware pour vérifier si l'utilisateur est administrateur ou gestionnaire
function isAdminOrManager(req, res, next) {
    var _a;
    console.log('Vérification de l\'autorisation: Admin ou Manager', (_a = req.user) === null || _a === void 0 ? void 0 : _a.typeUtilisateur);
    if (req.user &&
        (req.user.typeUtilisateur === 'administrateur' ||
            req.user.typeUtilisateur === 'gestionnaire')) {
        return next();
    }
    console.log('Utilisateur non autorisé pour Admin ou Manager');
    res.status(403).send('Accès refusé. Vous n\'êtes pas autorisé.');
}
// Middleware pour vérifier si l'utilisateur est administrateur
function isAdministrateur(req, res, next) {
    var _a, _b;
    console.log('Vérification de l\'autorisation: Administrateur', (_a = req.user) === null || _a === void 0 ? void 0 : _a.typeUtilisateur);
    if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.typeUtilisateur) === 'administrateur') {
        return next();
    }
    console.log('Utilisateur non autorisé pour Administrateur');
    res.status(403).send('Accès refusé. Vous n\'êtes pas un administrateur.');
}
// Middleware pour vérifier si l'utilisateur est gestionnaire
function isGestionnaire(req, res, next) {
    var _a, _b;
    console.log('Vérification de l\'autorisation: Gestionnaire', (_a = req.user) === null || _a === void 0 ? void 0 : _a.typeUtilisateur);
    if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.typeUtilisateur) === 'gestionnaire') {
        return next();
    }
    console.log('Utilisateur non autorisé pour Gestionnaire');
    res.status(403).send('Accès refusé. Vous n\'êtes pas un gestionnaire.');
}
