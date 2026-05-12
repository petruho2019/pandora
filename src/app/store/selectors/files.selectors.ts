import { createSelector } from '@ngrx/store';
import { FileState } from '../states/states';
import { filesAdapter } from '../adapters/adapters';

export const selectFilesState = (state: any): FileState => state.files;

export const { selectAll, selectEntities, selectIds, selectTotal } =
  filesAdapter.getSelectors(selectFilesState);

export const selectFile = (id: string) =>
  createSelector(selectEntities, (entities) => entities[id]);

export const selectFilesByReqId = (reqId: string) =>
  createSelector(selectAll, (files) => files.filter((f) => f.reqId === reqId));
