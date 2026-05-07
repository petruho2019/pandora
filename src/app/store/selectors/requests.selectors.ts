import { createSelector } from '@ngrx/store';
import { RequestModel } from '../../../../shared/models/requests/request';
import { RequestState } from '../states/states';
import { requestAdapter } from '../adapters/adapters';

export const selectRequestsState = (state: any): RequestState => state.requests;
export const { selectAll, selectEntities, selectIds, selectTotal } =
  requestAdapter.getSelectors(selectRequestsState);

export const selectLoadedByCollectionId = (props: { collectionId: string }) =>
  createSelector(selectRequestsState, (state: RequestState) =>
    state.loadedByCollectionId.get(props.collectionId),
  );

export const selectRequestsByCollectionId = (props: { collectionId: string }) =>
  createSelector(selectAll, (requests: RequestModel[]) =>
    requests.filter((r) => r.collectionId === props.collectionId),
  );

export const selectRequest = (props: { id: string }) =>
  createSelector(selectAll, (requests: RequestModel[]) => requests.find((r) => r.id === props.id));
