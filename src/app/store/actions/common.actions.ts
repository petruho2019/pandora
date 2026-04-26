import { createAction, props } from "@ngrx/store";
import { AlertNotificationMessage } from "../../../../shared/models/dto/shared-dtos";


export const addAlertNotificationMessage = createAction('[AlertNotification] Add message', props<{message: AlertNotificationMessage}>())
