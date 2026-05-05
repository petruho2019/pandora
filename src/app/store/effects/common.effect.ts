import { AlertNotificationService } from './../../../../services/alert-notification-service';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  addAlertNotificationMessage,
  addFile,
  addFileFailure,
  addFileSuccess,
} from '../actions/common.actions';
import { catchError, from, map, of, switchMap, tap } from 'rxjs';
import { closeModal } from '../actions/modal-actions/modal.actions';
import { FilesElectronService } from '../../../../services/electron/files-electron-service';

export class CommonEffects {
  private actions$ = inject(Actions);
  private alertNotificationService = inject(AlertNotificationService);
  private commonElectronService = inject(FilesElectronService);

  addAlertNotificationMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addAlertNotificationMessage),
        tap(({ message }) => {
          this.alertNotificationService.addAlertNotification(message);
          return;
        }),
      ),
    { dispatch: false },
  );

  modalEffectSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(closeModal),
        tap(({ modalOverlay }) => modalOverlay?.detach()),
      ),
    { dispatch: false },
  );

  addFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addFile),
      switchMap(({ tableRowId, reqId, contentType }) =>
        from(this.commonElectronService.openFile()).pipe(
          map((result) => {
            console.log(`Результат добавления файла: ${JSON.stringify(result, null, 2)}`);
            return result.isSuccess
              ? addFileSuccess({
                  fileDto: { tableRowId, reqId, filePath: result.body!, contentType: contentType },
                })
              : addFileFailure();
          }),
          catchError((err) => of(addFileFailure())),
        ),
      ),
    ),
  );
}
