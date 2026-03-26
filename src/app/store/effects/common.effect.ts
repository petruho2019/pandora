import { AlertNotificationService } from './../../../../services/alert-notification-service';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { addAlertNotificationMessage } from '../actions/common.actions';
import { take, tap } from 'rxjs';
import { modalSuccess } from '../actions/modal-actions/modal.actions';

export class CommonEffects {
    private actions$ = inject(Actions); 
    private alertNotificationService = inject(AlertNotificationService);
 
    addAlertNotificationMessage$ = createEffect(() => this.actions$.pipe(
        ofType(addAlertNotificationMessage),
        tap(({ message }) =>{
            console.log(`Обработка ошибки: ${message}`);
            this.alertNotificationService.addAlertNotification(message);
            return;
        })
        
    ), { dispatch: false });

    modalEffectSuccess$ = createEffect(() => this.actions$.pipe(
        ofType(modalSuccess),
        tap(({modalOverlay}) => modalOverlay.detach())
    ), { dispatch: false })

}