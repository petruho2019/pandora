import { LoadRequestDto, OpenRequestInFSDto, UpdateRequestInfoDto } from './../../../../shared/models/requests/dto/request-dtos';
import { createAction, props } from "@ngrx/store";
import { RequestModel } from "../../../../shared/models/requests/request";
import { ModalActionDataT } from '../../../../shared/models/dto/action-modal-result-models';

export const loadRequests = createAction('[Request] Load', props<{collectionInfo: LoadRequestDto}>())
export const loadRequestsSuccess = createAction('[Request] Load Success', props<{loadedRequests: RequestModel[], collectionId: string}>())
export const loadRequestsFailure = createAction('[Request] Load Failure', props<{errorMessage: string}>())

export const openRequestInFS = createAction('[Request] Open in FS', props<{requestInfo: OpenRequestInFSDto}>());
export const openRequestInFSSuccess = createAction('[Request] Open Success in FS');
export const openRequestInFSFailure = createAction('[Request] Open Failure in FS', props<{errorMessage: string}>());

export const updateRequest = createAction('[Request] Update', props<{actionData: ModalActionDataT<UpdateRequestInfoDto>}>());
export const updateRequestSuccess = createAction('[Request] Update Success', props<{ req: RequestModel}>());
export const updateRequestFailure = createAction('[Request] Update Failure', props<{errorMessage: string}>());

export const moveRequest = createAction('[Request] Move', props<{fromIndex: number, toIndex: number }>());
