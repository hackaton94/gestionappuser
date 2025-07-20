import { Request } from "express";
import { SelectUser } from "@shared/schema";

// Extension des types Express pour inclure l'utilisateur authentifié
export interface AuthenticatedRequest extends Request {
  user: SelectUser;
}

// Extension générique pour les requêtes avec paramètres
export interface AuthenticatedRequestWithParams<T = {}> extends Request<T> {
  user: SelectUser;
}

export interface AuthenticatedRequestWithBody<T = {}> extends Request {
  body: T;
  user: SelectUser;
}

export interface AuthenticatedRequestWithParamsAndBody<P = {}, B = {}> extends Request<P> {
  body: B;
  user: SelectUser;
}