import { IpcMain } from 'electron';
import ElectronStore from 'electron-store';
import { CookieElectronSchema } from '../shared/electron/schemes';
import {
  buildFailureResult,
  buildFailureResultT,
  buildSuccessResultT,
  ResultT,
} from '../shared/models/result';
import { CookieModel } from '../shared/models/requests/http/http-request-model';
import { COOKIES_KEY } from './main';

export function initializeCookies(store: ElectronStore<CookieElectronSchema>, ipcMain: IpcMain) {
  //#region add
  ipcMain.handle(
    'add-cookie',
    async (
      event,
      cookieInfo: { fromServer: boolean; cookie: CookieModel },
    ): Promise<ResultT<CookieModel | null, string>> => {
      const { cookie, fromServer } = cookieInfo;

      const cookiesFromStore = store.get(COOKIES_KEY, []);

      if (!cookie.domain) return buildFailureResultT('Домен не может быть пустым');
      if (!cookie.name) return buildFailureResultT('Название не может быть пустым');
      if (fromServer && !cookie.value) return buildSuccessResultT(null);
      if (!cookie.value) return buildFailureResultT('Значение не может быть пустым');

      for (const cfs of cookiesFromStore) {
        if (cookie.domain === cfs.domain && cookie.name === cfs.name) {
          if (fromServer) return buildSuccessResultT(null);
          return buildFailureResultT('В данном домене уже есть cookie с таким названием');
        }
      }

      cookiesFromStore.push(cookie);
      store.set(COOKIES_KEY, cookiesFromStore);

      return buildSuccessResultT(cookie);
    },
  );

  //#region modify
  ipcMain.handle(
    'modify-cookie',
    async (event, cookie: CookieModel): Promise<ResultT<CookieModel, string>> => {
      const cookiesFromStore = store.get(COOKIES_KEY, []);

      if (!cookie.value) return buildFailureResultT('Значение не может быть пустым');

      if (!cookiesFromStore.find((c) => c.id === cookie.id))
        return buildFailureResultT('Ошибка при измении cookie');

      cookiesFromStore.push(cookie);

      cookiesFromStore.splice(
        cookiesFromStore.findIndex((c) => c.id === cookie.id),
        1,
        cookie,
      );

      store.set(COOKIES_KEY, cookiesFromStore);

      return buildSuccessResultT(cookie);
    },
  );

  //#region delete cookie
  ipcMain.handle(
    'delete-cookie',
    async (event, cookieId: string): Promise<ResultT<CookieModel[], string>> => {
      let cookiesFromStore = store.get(COOKIES_KEY, []);
      const cookieModelById = cookiesFromStore.find((c) => c.id === cookieId);

      if (!cookieModelById) return buildFailureResultT('Cookie не найдена');

      cookiesFromStore = cookiesFromStore.filter((c) => c.id !== cookieId);

      store.set(COOKIES_KEY, cookiesFromStore);

      return buildSuccessResultT(cookiesFromStore);
    },
  );

  //#region delete domain
  ipcMain.handle(
    'delete-domain',
    async (event, domainName: string): Promise<ResultT<CookieModel[], string>> => {
      let cookiesFromStore = store.get(COOKIES_KEY, []);

      if (!domainName) return buildFailureResultT('Ошибка при очищении домена');

      const cookiesByDomain = cookiesFromStore.filter((cfs) => cfs.domain === domainName);

      cookiesFromStore = cookiesFromStore.filter((cfs) => !cookiesByDomain.includes(cfs));

      store.set(COOKIES_KEY, cookiesFromStore);

      return buildSuccessResultT(cookiesFromStore);
    },
  );

  //#region load
  ipcMain.handle('load-cookies', (): CookieModel[] => {
    const cookiesFromStore = store.get(COOKIES_KEY, []);

    return cookiesFromStore;
  });
}
