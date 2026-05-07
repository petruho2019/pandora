import { CollectionState } from '../states/states';
import { collectionsAdapter } from '../adapters/adapters';
import { createSelector } from '@ngrx/store';

export const selectCollectionsState = (state: any): CollectionState => state.collections;

export const { selectAll, selectEntities, selectIds, selectTotal } =
  collectionsAdapter.getSelectors(selectCollectionsState);

export const selectCollection = (id: string) =>
  createSelector(selectEntities, (entities) => entities[id]);
