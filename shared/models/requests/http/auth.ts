export interface HttpBasicAuth {
  kind: 'basic';
  name: 'Базовая';
  username: string | null;
  password: string | null;
}

export interface HttpBearerAuth {
  kind: 'bearer';
  name: 'Bearer токен';
  token: string | null;
}

export interface HttpInheritAuth {
  kind: 'inherit';
  name: 'Наследовать из коллекции';
  authTypeFromColl: AuthKind;
}

export interface HttpNoAuth {
  kind: 'none';
  name: 'Без аутентификации';
}

export const AUTH_KIND = {
  BASIC: 'basic' as const,
  BEARER: 'bearer' as const,
  INHERIT: 'inherit' as const,
  NONE: 'none' as const,
} as const;

export type AuthKind = (typeof AUTH_KIND)[keyof typeof AUTH_KIND];
