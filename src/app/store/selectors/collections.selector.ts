import { CollectionState } from "../states/collection-state";
import { collectionsAdapter } from "../adapters/collection-adapter";
import { createSelector } from "@ngrx/store";


export const selectCollectionsState = (state: any): CollectionState => state.collections;
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = collectionsAdapter.getSelectors(selectCollectionsState);

export const selectCollectionError = () => createSelector(
  selectCollectionsState,
  (state) => state.error
);