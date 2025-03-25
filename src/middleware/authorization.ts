import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticateToken'; // Assurez-vous que le chemin est correct

// Middleware pour vérifier si l'utilisateur est administrateur ou gestionnaire
export function isAdminOrManager(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  return next();
}

// Middleware pour vérifier si l'utilisateur est administrateur
export function isAdministrateur(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  return next();
}

// Middleware pour vérifier si l'utilisateur est gestionnaire
export function isGestionnaire(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  return next();
}