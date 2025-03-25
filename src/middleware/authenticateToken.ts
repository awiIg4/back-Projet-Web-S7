// src/middleware/authenticateToken.ts

import { Request, Response, NextFunction } from 'express';
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

  console.log('authenticateToken - token:', token); // debug log

  if (!token) {
    req.user = { userId: 0, typeUtilisateur: 'invité' };
    console.warn('Pas de token, utilisateur invité.');
    next();
    return;
  }

  jwt.verify(token, accessTokenSecret, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    if (err || !decoded || typeof decoded === 'string') {
      req.user = { userId: 0, typeUtilisateur: 'invité' };
      console.warn('Token invalide ou expiré, utilisateur invité.');
      next();
      return;
    }

    const payload = decoded as MyJwtPayload;
    req.user = {
      userId: payload.userId,
      typeUtilisateur: payload.typeUtilisateur,
    };
    console.log('authenticateToken - user:', req.user);

    next();
  });
}