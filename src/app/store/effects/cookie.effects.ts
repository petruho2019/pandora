import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  addCookieModal,
  addCookieModalFailure,
  addCookieModalSuccess,
  deleteCookieModal,
  deleteCookieModalFailure,
  deleteCookieModalSuccess,
  deleteDomainModal,
  deleteDomainModalFailure,
  deleteDomainModalSuccess,
  modifyCookieModal,
  modifyCookieModalFailure,
  modifyCookieModalSuccess,
} from '../actions/modal-actions/cookie-modal.actions';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { CookieElectronService } from '../../../../services/electron/cookie-electron-service';
import { OverlayRef } from '@angular/cdk/overlay';
import { closeModal } from '../actions/modal-actions/modal.actions';
import { Store } from '@ngrx/store';
import { addAlertNotificationMessage } from '../actions/common.actions';
import { loadCookies, loadCookiesSuccess } from '../actions/cookies.actions';

export class CookieEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private cookieElectronService = inject(CookieElectronService);

  addCookie$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCookieModal),
      switchMap(({ actionData }) => {
        return from(this.cookieElectronService.addCookie(actionData.body)).pipe(
          map((addCookieResult) => {
            if (addCookieResult.isSuccess) {
              this.dispatchModalSuccess('Cookie успешно добавлена');
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              return addCookieModalSuccess({ addedCookie: addCookieResult.body! });
            } else {
              this.dispatchModalFailure(addCookieResult.error!);
              return addCookieModalFailure({ errorMessage: addCookieResult.error! });
            }
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при добавлении cookie';
            this.dispatchModalFailure(errorMessage);
            return of(addCookieModalFailure({ errorMessage: errorMessage }));
          }),
        );
      }),
    ),
  );

  modifyCookie$ = createEffect(() =>
    this.actions$.pipe(
      ofType(modifyCookieModal),
      switchMap(({ actionData }) => {
        return from(this.cookieElectronService.modifyCookie(actionData.body)).pipe(
          map((modifyCookieResult) => {
            if (modifyCookieResult.isSuccess) {
              this.dispatchModalSuccess('Cookie успешно изменена');
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              return modifyCookieModalSuccess({ modifiedCookie: modifyCookieResult.body! });
            } else {
              this.dispatchModalFailure(modifyCookieResult.error!);
              return modifyCookieModalFailure({ errorMessage: modifyCookieResult.error! });
            }
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при изменении cookie';
            this.dispatchModalFailure(errorMessage);
            return of(modifyCookieModalFailure({ errorMessage: errorMessage }));
          }),
        );
      }),
    ),
  );

  deleteCookie$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteCookieModal),
      switchMap(({ actionData }) => {
        return from(this.cookieElectronService.deleteCookie(actionData.body.cookieId)).pipe(
          map((deleteCookieResult) => {
            if (deleteCookieResult.isSuccess) {
              this.dispatchModalSuccess('Cookie успешно удалена');
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              return deleteCookieModalSuccess({ newCookies: deleteCookieResult.body! });
            } else {
              this.dispatchModalFailure(deleteCookieResult.error!);
              return deleteCookieModalFailure({ errorMessage: deleteCookieResult.error! });
            }
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при удалении cookie';
            this.dispatchModalFailure(errorMessage);
            return of(deleteCookieModalFailure({ errorMessage: errorMessage }));
          }),
        );
      }),
    ),
  );

  deleteDomain$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteDomainModal),
      switchMap(({ actionData }) => {
        return from(this.cookieElectronService.deleteDomain(actionData.body.domainName)).pipe(
          map((deleteDomainResult) => {
            if (deleteDomainResult.isSuccess) {
              this.dispatchModalSuccess('Домен успешно очищен');
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              return deleteDomainModalSuccess({ newCookies: deleteDomainResult.body! });
            } else {
              this.dispatchModalFailure(deleteDomainResult.error!);
              return deleteDomainModalFailure({ errorMessage: deleteDomainResult.error! });
            }
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при очищении домена';
            this.dispatchModalFailure(errorMessage);
            return of(deleteDomainModalFailure({ errorMessage: errorMessage }));
          }),
        );
      }),
    ),
  );

  loadCookies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCookies),
      switchMap(() => {
        return from(this.cookieElectronService.loadCookies()).pipe(
          map((cookies) => {
            return loadCookiesSuccess({ cookeis: cookies });
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при загрузке cookies';
            this.dispatchModalFailure(errorMessage);
            return of(addCookieModalFailure({ errorMessage: errorMessage }));
          }),
        );
      }),
    ),
  );

  dispatchCloseModal(modalOverlayRef: OverlayRef[]) {
    modalOverlayRef.forEach((ref) => {
      this.store.dispatch(closeModal({ modalOverlay: ref }));
    });
  }

  dispatchModalSuccess(successMessage: string) {
    this.store.dispatch(
      addAlertNotificationMessage({ message: { message: successMessage, showSuccess: true } }),
    );
  }

  dispatchModalFailure(errorMessage: string) {
    this.store.dispatch(
      addAlertNotificationMessage({ message: { message: errorMessage, showSuccess: false } }),
    );
  }
}
