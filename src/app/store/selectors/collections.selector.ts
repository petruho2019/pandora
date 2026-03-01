import { CollectionState } from "../states/collection-state";
import { collectionsAdapter } from "../adapters/collection-adapter";


export const selectCollectionsState = (state: any): CollectionState => state.collections;
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = collectionsAdapter.getSelectors(selectCollectionsState);