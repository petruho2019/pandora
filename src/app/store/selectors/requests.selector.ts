import { createSelector } from "@ngrx/store";
import { requestAdapter } from "../adapters/request-adapter";
import { RequestState } from "../states/request-state";
import { RequestModel } from "../../../../shared/models/requests/request";


export const selectRequestsState = (state: any): RequestState => state.requests;
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = requestAdapter.getSelectors(selectRequestsState);

export const selectLoadedByCollectionId = (props: { collectionId: string }) => createSelector(
  selectRequestsState,
  (state: RequestState) =>
    state.loadedByCollectionId.get(props.collectionId)
);

export const selectRequestsByCollectionId = (props: { collectionId: string }) => createSelector(
  selectAll,
  (requests: RequestModel[]) =>
    requests.filter(r => r.collectionId === props.collectionId)
);

