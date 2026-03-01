import { createAction, props } from "@ngrx/store";
import { CollectionEntity } from "../../../../shared/models/entitys/collection-entity";
import { Collection } from "../../../../shared/models/collections/collection";

export const addCollection = createAction(
  '[Collections] Add Requested',
  props<{ name: string; path: string }>()
);
export const addCollectionSuccess = createAction(
  '[Collections] Add Success',
  props<{ collection: Collection }>()
);
export const addCollectionFailure = createAction('[Collections] Add Failure', props<{error: any}>());

export const loadCollections = createAction('[Collections] Load');
export const loadCollectionsSuccess = createAction('[Collections] Load Success', props<{ collections: Collection[] }>());
export const loadCollectionsFailure = createAction('[Collections] Load Failure', props<{error: any}>());

export const openCollection = createAction('[Collections] Open');
export const openCollectionSuccess = createAction('[Collections] Open Success', props<{collection: Collection}>());
export const openCollectionFailure = createAction('[Collections] Open Failure', props<{error: any}>());
export const openCollectionCancel = createAction('[Collections] Open Cancel');