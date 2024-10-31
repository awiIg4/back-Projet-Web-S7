// src/middleware/authenticateToken.ts

import { Request, Response, NextFunction } from '../../backend/node_modules/@types/express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'votre-clé-secrète';

// Interface pour la requête authentifiée
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    typeUtilisateur: string;
  };
}

// Interface pour le payload du JWT
interface MyJwtPayload extends JwtPayload {
  userId: number;
  typeUtilisateur: string;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies.accessToken;

  console.log('authenticateToken - token:', token); // Log pour débogage

  if (!token) {
    res.status(401).send('Token manquant. Veuillez vous connecter.');
    return;
  }

  jwt.verify(token, accessTokenSecret, (err: VerifyErrors | null, decoded: any) => {
    if (err || !decoded || typeof decoded === 'string') {
      console.error('authenticateToken - error:', err); // Log de l'erreur
      res.status(403).send('Token invalide ou expiré.');
      return;
    }

    req.user = {
      userId: (decoded as MyJwtPayload).userId,
      typeUtilisateur: (decoded as MyJwtPayload).typeUtilisateur,
    };

    console.log('authenticateToken - user:', req.user); // Log de l'utilisateur

    next();
  });
}