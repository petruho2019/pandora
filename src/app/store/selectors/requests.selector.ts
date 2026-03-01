import { createSelector } from "@ngrx/store";
import { requestAdapter } from "../adapters/request-adapter";
import { RequestState } from "../states/request-state";
import { collectionsReducer } from "../reducers/collections.reducer";


export const selectRequestsState = (state: any): RequestState => state.requests;
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = requestAdapter.getSelectors(selectRequestsState);
export const getRequestsByCollectionId = (colId: string) => createSelector(selectAll, (requests) => requests.filter(r => r.collectionId === colId))