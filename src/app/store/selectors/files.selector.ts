import { createSelector } from '@ngrx/store';
import { filesAdapter } from '../adapters/file-adapter';
import { FileState } from '../states/files-state';

export const selectFilesState = (state: any): FileState => state.files;

export const { selectAll, selectEntities, selectIds, selectTotal } =
  filesAdapter.getSelectors(selectFilesState);

export const selectCollection = (id: string) =>
  createSelector(selectEntities, (entities) => entities[id]);

export const selectFilesByReqId = (reqId: string) =>
  createSelector(selectAll, (files) => files.filter((f) => f.reqId === reqId));
