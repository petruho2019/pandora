import { Injectable } from '@angular/core';
import { CookieModel } from '../../shared/models/requests/http/http-request-model';
import { ResultT } from '../../shared/models/result';

@Injectable({ providedIn: 'root' })
export class CookieElectronService {
  addCookie(cookie: CookieModel): Promise<ResultT<CookieModel, string>> {
    return (window as any).electronAPI?.addCookie(cookie);
  }
  modifyCookie(cookie: CookieModel): Promise<ResultT<CookieModel, string>> {
    return (window as any).electronAPI?.modifyCookie(cookie);
  }

  deleteCookie(cookieId: string): Promise<ResultT<CookieModel[], string>> {
    return (window as any).electronAPI?.deleteCookie(cookieId);
  }
  deleteDomain(domainName: string): Promise<ResultT<CookieModel[], string>> {
    return (window as any).electronAPI?.deleteDomain(domainName);
  }

  loadCookies(): Promise<CookieModel[]> {
    return (window as any).electronAPI?.loadCookies();
  }
}
