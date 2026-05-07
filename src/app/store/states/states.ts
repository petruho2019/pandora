import { EntityState } from '@ngrx/entity';
import { Collection } from '../../../../shared/models/collections/collection';
import { RequestModel } from '../../../../shared/models/requests/request';
import { FileModel } from '../../../../shared/models/files/file';
import { CookieModel } from '../../../../shared/models/requests/http/http-request-model';

export interface CollectionState extends EntityState<Collection> {
  loading: boolean;
  error: string | null;
}

export interface RequestState extends EntityState<RequestModel> {
  loadedByCollectionId: Map<string, boolean>;
}

export interface FileState extends EntityState<FileModel> {}

export interface CookieState extends EntityState<CookieModel> {}
