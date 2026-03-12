import { RequestModel } from './../../models/requests/request';

export interface RequestsStoreSchema {
  loadedRequests: RequestModel[];
}