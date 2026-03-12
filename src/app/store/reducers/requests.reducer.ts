import { createReducer, on } from "@ngrx/store";
import { RequestState } from "../states/request-state";
import { requestAdapter } from "../adapters/request-adapter";
import { createRequestSuccess, loadRequestsSuccess, renameRequestSuccess } from "../actions/requests.actions";

export const requestFeatureKey = 'requests';

export const initialState: RequestState = {
    ...requestAdapter.getInitialState(),
    loadedByCollectionId: new Map<string, boolean>()
}
;

export const requestsReducer = createReducer(
    initialState,
    on(createRequestSuccess, (state, { request }) => requestAdapter.addOne(request, state)),
    on(loadRequestsSuccess, (state, {loadedRequests: requests, collectionId}) => {
        try {
            console.log(`Запросы: ${JSON.stringify(requests)}, id коллекции: ${collectionId}`);
            state.loadedByCollectionId.set(collectionId, true);
            return requestAdapter.addMany(requests, state)
        } catch (error) {
            throw new Error("Ошибка при Установки запросов в стейт")
        }
    }),
    on(renameRequestSuccess, (state, {renamedRequest: req}) => 
        requestAdapter.updateOne({
            id: req.id,
            changes: req
        }, state)
    )
);
 