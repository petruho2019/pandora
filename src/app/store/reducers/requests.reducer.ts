import { cloneCollection } from './../actions/collections.actions';
import { createReducer, on } from "@ngrx/store";
import { RequestState } from "../states/request-state";
import { requestAdapter } from "../adapters/request-adapter";
import { cloneRequestFailure, cloneRequestSuccess, createRequestSuccess, loadRequestsSuccess, moveRequest, openRequestInFSFailure, renameRequestSuccess } from "../actions/requests.actions";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { RequestModel } from "../../../../shared/models/requests/request";

export const requestFeatureKey = 'requests';

export const initialState: RequestState = {
    ...requestAdapter.getInitialState(),
    loadedByCollectionId: new Map<string, boolean>(),
    error: null
};

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
    ),
    on(moveRequest, (state, {fromIndex: fromIndex, toIndex: toIndex}) => {
        const requests = Object.values(state.entities);
        console.log(`Запросы перед перемещением: ${JSON.stringify(requests)}`);
        moveItemInArray(requests, fromIndex, toIndex);
        console.log(`Запросы после перемещения: ${JSON.stringify(requests)}`);
        return requestAdapter.setAll(requests as RequestModel[], state);
    }),

    on(cloneRequestSuccess, (state, {clonedRequest}) => requestAdapter.addOne(clonedRequest, {...state, error: null})),
    on(cloneRequestFailure, (state, {errorMessage}) => ({...state, error: errorMessage})),
    
    on(openRequestInFSFailure, (state, {errorMessage}) => ({...state, error: errorMessage})),
);
 