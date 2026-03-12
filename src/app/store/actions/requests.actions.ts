import { LoadRequestDto } from './../../../../shared/models/requests/dto/request-dtos';
import { createAction, props } from "@ngrx/store";
import { CreateRequestInfo as CreateRequestInfo } from "../../../../shared/models/event-models/add-request-info";
import { RequestModel } from "../../../../shared/models/requests/request";
import { CreateRequestError } from "../../../../shared/models/error/error";
import { RenameRequestDto } from "../../../../shared/models/requests/dto/request-dtos";

export const loadRequests = createAction('[Request] Load', props<{collectionInfo: LoadRequestDto}>())
export const loadRequestsSuccess = createAction('[Request] Load Success', props<{loadedRequests: RequestModel[], collectionId: string}>())
export const loadRequestsFailure = createAction('[Request] Load Failure', props<{errorMessage: string}>())

export const createHttpRequest = createAction( '[Request] Create Http', props<{ requestInfo: CreateRequestInfo }>());
export const createRequestSuccess = createAction( '[Request] Create Success', props<{ request: RequestModel }>());
export const createRequestFailure = createAction( '[Request] Create Failure', props<{error: CreateRequestError}>());

export const renameRequest = createAction('[Request] Rename', props<{requestInfo: RenameRequestDto}>());
export const renameRequestSuccess = createAction('[Request] Rename Success', props<{renamedRequest: RequestModel}>());
export const renameRequestFailure = createAction('[Request] Rename Failure', props<{errorMessage: string}>());