"use strict";
// src/middleware/authenticateToken.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'votre-clé-secrète';
function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;
    console.log('authenticateToken - token:', token); // Log pour débogage
    if (!token) {
        res.status(401).send('Token manquant. Veuillez vous connecter.');
        return;
    }
    jsonwebtoken_1.default.verify(token, accessTokenSecret, (err, decoded) => {
        if (err || !decoded || typeof decoded === 'string') {
            console.error('authenticateToken - error:', err); // Log de l'erreur
            res.status(403).send('Token invalide ou expiré.');
            return;
        }
        req.user = {
            userId: decoded.userId,
            typeUtilisateur: decoded.typeUtilisateur,
        };
        console.log('authenticateToken - user:', req.user); // Log de l'utilisateur
        next();
    });
}
