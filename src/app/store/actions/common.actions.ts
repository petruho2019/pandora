import { createAction, props } from "@ngrx/store";


export const addAlertNotificationMessage = createAction('[AlertNotification] Add message', props<{message: string}>())
