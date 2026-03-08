import { createReducer, on } from "@ngrx/store";
import { RequestState } from "../states/request-state";
import { requestAdapter } from "../adapters/request-adapter";
import { createRequestSuccess } from "../actions/requests.actions";

export const requestFeatureKey = 'requests';

export const initialState: RequestState = 
    requestAdapter.getInitialState()
;

export const requestsReducer = createReducer(
    initialState,
    on(createRequestSuccess, (state, { request }) => requestAdapter.addOne(request, state))
);
 