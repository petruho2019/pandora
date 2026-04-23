import { CollectionState } from "../states/collection-state";
import { collectionsAdapter } from "../adapters/collection-adapter";
import { createSelector } from "@ngrx/store";


export const selectCollectionsState = (state: any): CollectionState => state.collections;
export const selectCollectionsModalState = (state: any): CollectionState => state.collectionsModal;

export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = collectionsAdapter.getSelectors(selectCollectionsState);

export const selectCollection = (id: string) => createSelector(
  selectEntities,
  entities => entities[id]
);

export const selectCollectionError = () => createSelector(
  selectCollectionsState,
  (state) => state.error
);

export const selectCollectionModalError = () => createSelector(
  selectCollectionsModalState,
  (state) => state.error
);

