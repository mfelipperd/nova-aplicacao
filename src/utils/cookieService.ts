export class CookieService {
  /**
   * Salva um cookie com o nome, valor e opções especificadas
   */
  static setCookie(name: string, value: string, options: {
    expires?: Date;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}): void {
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }
    
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    if (options.secure) {
      cookieString += `; secure`;
    }
    
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieString;
  }

  /**
   * Recupera o valor de um cookie pelo nome
   */
  static getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    
    return null;
  }

  /**
   * Remove um cookie pelo nome
   */
  static removeCookie(name: string, path: string = '/'): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  }

  /**
   * Verifica se um cookie existe
   */
  static hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }
}

// Constantes para os nomes dos cookies
export const COOKIE_NAMES = {
  LAST_EVENT_ID: 'lastEventId',
  LAST_EVENT_NAME: 'lastEventName',
  LAST_EVENT_INVITE_CODE: 'lastEventInviteCode'
} as const;
