import { createAction, props } from "@ngrx/store";
import { CreateRequestInfo } from "../../../../../shared/models/event-models/add-request-info";
import { RequestModel } from "../../../../../shared/models/requests/request";
import { CloneRequestDto, RenameRequestDto } from "../../../../../shared/models/requests/dto/request-dtos";
import { ModalActionDataT } from "../../../../../shared/models/dto/action-modal-result-models";

export const createHttpRequest = createAction( '[Request] Create Http', props<{ actionData: ModalActionDataT<CreateRequestInfo> }>());
export const createRequestSuccess = createAction( '[Request] Create Success', props<{ request: RequestModel }>());
export const createRequestFailure = createAction( '[Request] Create Failure', props<{errorMessage: string}>());

export const renameRequest = createAction('[Request] Rename', props<{actionData: ModalActionDataT<RenameRequestDto>}>());
export const renameRequestSuccess = createAction('[Request] Rename Success', props<{renamedRequest: RequestModel}>());
export const renameRequestFailure = createAction('[Request] Rename Failure', props<{errorMessage: string}>());

export const cloneRequest = createAction('[Request] Clone', props<{actionData: ModalActionDataT<CloneRequestDto>}>());
export const cloneRequestSuccess = createAction('[Request] Clone Success', props<{clonedRequest: RequestModel}>());
export const cloneRequestFailure = createAction('[Request] Clone Failure', props<{errorMessage: string}>());
