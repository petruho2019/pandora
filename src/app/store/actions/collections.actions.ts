import { createAction, props } from "@ngrx/store";
import { Collection } from "../../../../shared/models/collections/collection";
import { CloneCollectionDto, RenameCollectionDto } from "../../../../shared/models/collections/dto/collection-action-dtos";

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

export const removeCollection = createAction('[Collection] Remove', props<{collectionId: string}>());
export const removeCollectionSuccess = createAction('[Collection] Remove Success', props<{collections: Collection[]}>());
export const removeCollectionFailure = createAction('[Collection] Remove Failure', props<{errorMessage: string}>());

export const cloneCollection = createAction('[Collection] Clone', props<{collectionInfo: CloneCollectionDto}>());
export const cloneCollectionSuccess = createAction('[Collection] Clone Success', props<{clonedCollection: Collection}>());
export const cloneCollectionFailure = createAction('[Collection] Clone Failure', props<{errorMessage: string}>());

export const renameCollection = createAction('[Collection] Rename', props<{collectionInfo: RenameCollectionDto}>());
export const renameCollectionSuccess = createAction('[Collection] Rename Success', props<{renamedCollection: Collection}>());
export const renameCollectionFailure = createAction('[Collection] Rename Failure', props<{errorMessage: string}>());