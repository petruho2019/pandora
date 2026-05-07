import { createEntityAdapter } from '@ngrx/entity';
import { Collection } from '../../../../shared/models/collections/collection';
import { FileModel } from '../../../../shared/models/files/file';
import { RequestModel } from '../../../../shared/models/requests/request';
import { CookieModel } from '../../../../shared/models/requests/http/http-request-model';

export const collectionsAdapter = createEntityAdapter<Collection>({
  selectId: (collection) => collection.id,
});

export const filesAdapter = createEntityAdapter<FileModel>({
  selectId: (file) => file.id,
});

export const requestAdapter = createEntityAdapter<RequestModel>({
  selectId: (request) => request.id,
});

export const cookieAdapter = createEntityAdapter<CookieModel>({
  selectId: (cookie) => cookie.id,
});
