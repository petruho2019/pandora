import { createAction, props } from "@ngrx/store";
import { ModalActionDataT } from "../../../../../shared/models/dto/action-modal-result-models";
import { CloneCollectionDto } from "../../../../../shared/models/collections/dto/collection-action-dtos";
import { Collection } from "../../../../../shared/models/collections/collection";
import { AddCollectionDto, RenameDto } from "../../../../../shared/models/dto/shared-dtos";

export const addCollectionModal = createAction('[CollectionsModal] Add', props<{ actionData: ModalActionDataT<AddCollectionDto> }>());
export const addCollectionModalSuccess = createAction('[CollectionsModal] Add Success', props<{ addedCollection: Collection }>());
export const addCollectionModalFailure = createAction('[CollectionsModal] Add Failure', props<{ errorMessage: string }>());

export const closeCollectionModal = createAction('[CollectionsModal] Close', props<{ actionData: ModalActionDataT<{collectionId: string}> }>());
export const closeCollectionModalSuccess = createAction('[CollectionsModal] Close Success', props<{ newCollections: Collection[] }>());
export const closeCollectionModalFailure = createAction('[CollectionsModal] Close Failure', props<{ errorMessage: string }>());

export const cloneCollectionModal = createAction('[CollectionsModal] Clone', props<{ actionData: ModalActionDataT<CloneCollectionDto> }>());
export const cloneCollectionModalSuccess = createAction('[CollectionsModal] Clone Success', props<{ clonedCollection: Collection }>());
export const cloneCollectionModalFailure = createAction('[CollectionsModal] Clone Failure', props<{ errorMessage: string }>());

export const renameCollectionModal = createAction('[CollectionsModal] Rename', props<{ actionData: ModalActionDataT<RenameDto> }>());
export const renameCollectionModalSuccess = createAction('[CollectionsModal] Rename Success', props<{ renamedCollection: Collection }>());
export const renameCollectionModalFailure = createAction('[CollectionsModal] Rename Failure', props<{ errorMessage: string }>());

export const deleteCollectionModal = createAction('[CollectionsModal] Delete', props<{ actionData: ModalActionDataT<string> }>());
export const deleteCollectionModalSuccess = createAction('[CollectionsModal] Delete Success', props<{ newCollections: Collection[] }>());
export const deleteCollectionModalFailure = createAction('[CollectionsModal] Delete Failure', props<{ errorMessage: string }>());
