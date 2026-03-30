import { createReducer, on } from "@ngrx/store";
import { RequestState } from "../states/request-state";
import { requestAdapter } from "../adapters/request-adapter";
import { loadRequestsSuccess, moveRequest } from "../actions/requests.actions";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { RequestModel } from "../../../../shared/models/requests/request";
import { cloneRequestSuccess, createRequestSuccess, deleteRequestSuccess, renameRequestSuccess } from "../actions/modal-actions/request-modal.actions";

export const requestFeatureKey = 'requests';

export const initialState: RequestState = {
    ...requestAdapter.getInitialState(),
    loadedByCollectionId: new Map<string, boolean>(),
    error: null
};

export const requestsReducer = createReducer(
    initialState,
    on(loadRequestsSuccess, (state, {loadedRequests: requests, collectionId}) => {
        try {
            console.log(`Запросы: ${JSON.stringify(requests)}, id коллекции: ${collectionId}`);
            state.loadedByCollectionId.set(collectionId, true);
            return requestAdapter.addMany(requests, state)
        } catch (error) {
            throw new Error("Ошибка при Установки запросов в стейт")
        }
    }),
    
    on(createRequestSuccess, (state, { request }) => 
        requestAdapter.addOne(request, state)
    ),

    on(renameRequestSuccess, (state, {renamedRequest: req}) => 
        requestAdapter.updateOne({
            id: req.id,
            changes: req
        }, state)
    ),

    on(moveRequest, (state, {fromIndex: fromIndex, toIndex: toIndex}) => {
        const requests = Object.values(state.entities);
        console.log(`Запросы перед перемещением: ${JSON.stringify(requests)}`);
        moveItemInArray(requests, fromIndex, toIndex);
        console.log(`Запросы после перемещения: ${JSON.stringify(requests)}`);
        return requestAdapter.setAll(requests as RequestModel[], state);
    }),

    on(cloneRequestSuccess, (state, {clonedRequest}) => 
        requestAdapter.addOne(clonedRequest, {...state, error: null})
    ),

    on(deleteRequestSuccess, (state, { newRequests }) => 
        requestAdapter.setAll(newRequests, state )
    )
);
 