export interface BasicAuth {
    kind: 'basic',
    name: 'Базовая'
    username: string | null ,
    password: string | null
}

export interface BearerAuth {
    kind: 'bearer',
    name: 'Bearer токен',
    token: string | null,
}

export interface InheritAuth {
    kind: 'inherit',
    name: 'Наследовать из коллекции',
    authTypeFromColl: AuthKind,
}

export interface NoAuth {
    kind: 'none',
    name: 'Без аутентификации'
}

export const AUTH_KIND = {
  BASIC: 'basic' as const,
  BEARER: 'bearer' as const,
  INHERIT: 'inherit' as const,
  NONE: 'none' as const,
} as const;

export type AuthKind = typeof AUTH_KIND[keyof typeof AUTH_KIND];