import { createAction, props } from '@ngrx/store';
import { AlertNotificationMessage } from '../../../../shared/models/dto/shared-dtos';
import { GetFileDto } from '../../../../shared/models/files/dtos';

export const addAlertNotificationMessage = createAction(
  '[AlertNotification] Add message',
  props<{ message: AlertNotificationMessage }>(),
);

export const addFile = createAction(
  '[File] Add',
  props<{ tableRowId: string; reqId: string; contentType: string | null }>(),
);
export const addFileSuccess = createAction('[File] Add Success', props<{ fileDto: GetFileDto }>());
export const addFileFailure = createAction('[File] Add Failure');
