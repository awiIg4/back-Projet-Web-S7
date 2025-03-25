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

  if (token) {
    jwt.verify(
      token,
      accessTokenSecret,
      (err: VerifyErrors | null, decoded: MyJwtPayload | undefined) => {
        if (decoded) {
          // Token valide
          req.user = {
            userId: decoded.userId,
            typeUtilisateur: decoded.typeUtilisateur,
          };
        } else {
          // Token invalide ou expiré => on essaye de décoder "à la main"
          try {
            const payloadBase64 = token.split('.')[1];
            const payloadBuffer = Buffer.from(payloadBase64, 'base64');
            const payload = JSON.parse(payloadBuffer.toString());

            req.user = {
              userId: payload.userId || 0,
              typeUtilisateur: payload.typeUtilisateur || 'invité',
            };
            console.warn('authenticateToken - invalid token but decoded payload:', req.user);
          } catch (decodeError) {
            req.user = {
              userId: 0,
              typeUtilisateur: 'invité',
            };
            console.warn('authenticateToken - unable to decode token, using default invité user');
          }
        }
        next();
      }
    );
  } else {
    req.user = {
      userId: 0,
      typeUtilisateur: 'invité',
    };
    next();
  }
}