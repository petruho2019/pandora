import { createAction, props } from '@ngrx/store';
import { Collection } from '../../../../shared/models/collections/collection';
import {
  UpdateCollectionAuth,
  UpdateCollectionHeaders,
} from '../../../../shared/models/collections/dto/collection-action-dtos';

export const loadCollections = createAction('[Collections] Load');
export const loadCollectionsSuccess = createAction(
  '[Collections] Load Success',
  props<{ collections: Collection[] }>(),
);
export const loadCollectionsFailure = createAction(
  '[Collections] Load Failure',
  props<{ errorMessage: any }>(),
);

export const openCollection = createAction('[Collections] Open');
export const openCollectionSuccess = createAction(
  '[Collections] Open Success',
  props<{ collection: Collection }>(),
);
export const openCollectionFailure = createAction(
  '[Collections] Open Failure',
  props<{ errorMessage: any }>(),
);
export const openCollectionCancel = createAction('[Collections] Open Cancel');

export const openCollectionInFS = createAction(
  '[Collections] Open in FS',
  props<{ collectionId: string }>(),
);
export const openCollectionInFSSuccess = createAction('[Collections] Open Success in FS');
export const openCollectionInFSFailure = createAction('[Collections] Open Failure in FS');

export const updateCollectionHeaders = createAction(
  '[Collections] Update headers',
  props<{ updateDto: UpdateCollectionHeaders }>(),
);
export const updateCollectionHeadersSuccess = createAction(
  '[Collections] Update headers Success',
  props<{ coll: Collection }>(),
);
export const updateCollectionHeadersFailure = createAction(
  '[Collections] Update headers Failure',
  props<{ errorMessage: string }>(),
);

export const updateCollectionAuth = createAction(
  '[Collections] Update auth',
  props<{ updateDto: UpdateCollectionAuth }>(),
);
export const updateCollectionAuthSuccess = createAction(
  '[Collections] Update auth Success',
  props<{ coll: Collection }>(),
);
export const updateCollectionAuthFailure = createAction(
  '[Collections] Update auth Failure',
  props<{ errorMessage: string }>(),
);

export const moveCollection = createAction(
  '[Collections] Move',
  props<{ fromIndex: number; toIndex: number }>(),
);
