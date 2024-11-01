import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticateToken'; // Assurez-vous que le chemin est correct

// Middleware pour vérifier si l'utilisateur est administrateur ou gestionnaire
export function isAdminOrManager(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  console.log('Vérification de l\'autorisation: Admin ou Manager', req.user?.typeUtilisateur);
  if (
    req.user &&
    (req.user.typeUtilisateur === 'administrateur' ||
      req.user.typeUtilisateur === 'gestionnaire')
  ) {
    return next();
  }
  console.log('Utilisateur non autorisé pour Admin ou Manager');
  res.status(403).send('Accès refusé. Vous n\'êtes pas autorisé.');
}

// Middleware pour vérifier si l'utilisateur est administrateur
export function isAdministrateur(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  console.log('Vérification de l\'autorisation: Administrateur', req.user?.typeUtilisateur);
  if (req.user?.typeUtilisateur === 'administrateur') {
    return next();
  }
  console.log('Utilisateur non autorisé pour Administrateur');
  res.status(403).send('Accès refusé. Vous n\'êtes pas un administrateur.');
}

// Middleware pour vérifier si l'utilisateur est gestionnaire
export function isGestionnaire(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  console.log('Vérification de l\'autorisation: Gestionnaire', req.user?.typeUtilisateur);
  if (req.user?.typeUtilisateur === 'gestionnaire') {
    return next();
  }
  console.log('Utilisateur non autorisé pour Gestionnaire');
  res.status(403).send('Accès refusé. Vous n\'êtes pas un gestionnaire.');
}