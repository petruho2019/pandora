import { createAction, props } from "@ngrx/store";
import { CreateRequestInfo as CreateRequestInfo } from "../../../../shared/models/event-models/add-request-info";
import { RequestModel } from "../../../../shared/models/requests/request";
import { CreateRequestError } from "../../../../shared/models/error/error";

export const createHttpRequest = createAction(
    '[Requests] Create Http',
    props<{ collectionPath: string; collectionId: string; requestInfo: CreateRequestInfo }>()
);
export const createRequestSuccess = createAction(
    '[Requests] Create Success',
    props<{ request: RequestModel }>()
);
export const createRequestFailure = createAction(
    '[Requests] Create Failure', 
    props<{error: CreateRequestError}>()
);
export const requestCreated = createAction(
    '[Requests] Created',
    props<{collectionId: string, requestInfo: CreateRequestInfo}>
)