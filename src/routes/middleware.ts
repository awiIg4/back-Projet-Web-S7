import { Request, Response, NextFunction } from 'express';

// Si vous avez une interface pour AuthenticatedRequest, importez-la ou définissez-la ici
export interface AuthenticatedRequest extends Request {
  user?: {
    typeUtilisateur: string;
    // Ajoutez d'autres propriétés si nécessaire
  };
}

// Middleware pour vérifier si l'utilisateur est administrateur ou gestionnaire
export function isAdminOrManager(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user && (req.user.typeUtilisateur === 'administrateur' || req.user.typeUtilisateur === 'gestionnaire')) {
    return next();
  }
  res.status(403).send('Accès refusé. Vous n\'êtes pas autorisé.');
}

// Middleware pour vérifier si l'utilisateur est administrateur
export function isAdministrateur(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.typeUtilisateur !== 'administrateur') {
    res.status(403).send('Accès refusé. Vous n\'êtes pas un administrateur.');
    return;
  }
  next();
}

// Middleware pour vérifier si l'utilisateur est gestionnaire
export function isGestionnaire(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.typeUtilisateur !== 'gestionnaire') {
    res.status(403).send('Accès refusé. Vous n\'êtes pas un gestionnaire.');
    return;
  }
  next();
}
