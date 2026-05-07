import { Collection } from '../models/collections/collection';
import { CookieModel } from '../models/requests/http/http-request-model';
import { RequestModel } from '../models/requests/request';

export interface CollectionsElectronSchema {
  loadedCollections: Collection[];
}

export interface RequestsElectronSchema {
  loadedRequests: RequestModel[];
}

export interface CookieElectronSchema {
  loadedCookies: CookieModel[]
}