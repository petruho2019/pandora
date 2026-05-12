import { CollectionElectronService } from '../../../../services/electron/collection-electron-service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  from,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  loadCollections,
  loadCollectionsFailure,
  loadCollectionsSuccess,
  openCollection,
  openCollectionCancel,
  openCollectionFailure,
  openCollectionInFS,
  openCollectionSuccess,
  updateCollectionAuth,
  updateCollectionAuthFailure,
  updateCollectionAuthSuccess,
  updateCollectionHeaders,
  updateCollectionHeadersFailure,
  updateCollectionHeadersSuccess,
} from '../actions/collections.actions';
import {
  addCollectionModal,
  addCollectionModalFailure,
  addCollectionModalSuccess,
  cloneCollectionModal,
  cloneCollectionModalFailure,
  cloneCollectionModalSuccess,
  closeCollectionModal,
  closeCollectionModalFailure,
  closeCollectionModalSuccess,
  deleteCollectionModal,
  deleteCollectionModalFailure,
  deleteCollectionModalSuccess,
  renameCollectionModal,
  renameCollectionModalFailure,
  renameCollectionModalSuccess,
} from '../actions/modal-actions/collections-modal.actions';
import { closeModal } from '../actions/modal-actions/modal.actions';
import { Store } from '@ngrx/store';
import { OverlayRef } from '@angular/cdk/overlay';
import { addAlertNotificationMessage } from '../actions/common.actions';

export class CollectionEffects {
  private actions$ = inject(Actions);
  private electronService = inject(CollectionElectronService);
  private store = inject(Store);

  loadCollections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCollections),
      switchMap(() =>
        from(this.electronService.loadCollections()).pipe(
          map((colls) => {
            return loadCollectionsSuccess({ collections: colls });
          }),
          catchError((error) => {
            const errorMessage = 'Непредвиденная ошибка при загрузке коллекций';
            this.dispatchFailure(errorMessage);
            return of(loadCollectionsFailure({ errorMessage: errorMessage }));
          }),
        ),
      ),
    ),
  );

  addCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCollectionModal),
      switchMap(({ actionData }) =>
        from(this.electronService.addCollection(actionData.body)).pipe(
          map((addCollectionResult) => {
            if (addCollectionResult.isSuccess) {
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              this.dispatchSuccess('Коллекция успешно добавлена');
              return addCollectionModalSuccess({ addedCollection: addCollectionResult.body! });
            } else {
              this.dispatchFailure(addCollectionResult.error!);
              return addCollectionModalFailure({ errorMessage: addCollectionResult.error! });
            }
          }),
          catchError((err) => {
            const errorMessage = 'Непредвиденная ошибка при добавлении коллекций';
            this.dispatchFailure(errorMessage);
            return of(addCollectionModalFailure({ errorMessage: errorMessage }));
          }),
        ),
      ),
    ),
  );

  openCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openCollection),
      exhaustMap(() => {
        return from(this.electronService.selectFolder()).pipe(
          map((path) => ({ path })),
          catchError((err) => {
            return of({ path: null });
          }),
        );
      }),
      switchMap(({ path }) => {
        if (!path) {
          return of(openCollectionCancel());
        }

        return from(this.electronService.openCollection({ collectionPath: path })).pipe(
          map((openCollectionResult) => {
            if (openCollectionResult.isSuccess) {
              this.dispatchSuccess('Коллекция успешно открыта');
              return openCollectionSuccess({ collection: openCollectionResult.body! });
            } else {
              this.dispatchFailure(openCollectionResult.error!);
              return openCollectionFailure({ errorMessage: openCollectionResult.error });
            }
          }),
          catchError((err) => {
            const errorMessage = 'Непредвиденная ошибка при открытии коллекций';
            this.dispatchFailure(errorMessage);
            return of(openCollectionFailure({ errorMessage: errorMessage }));
          }),
        );
      }),
    ),
  );

  removeCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(closeCollectionModal),
      switchMap(({ actionData }) =>
        from(this.electronService.removeCollection(actionData.body.collectionId)).pipe(
          map((collections) => {
            this.dispatchCloseModal(actionData.modalOverlayRefs!);
            this.dispatchSuccess('Коллекция успешно закрыта');
            return closeCollectionModalSuccess({ newCollections: collections });
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при удалении коллекций';
            this.dispatchFailure(errorMessage);
            return of(closeCollectionModalFailure({ errorMessage: errorMessage }));
          }), // Скорее всего невозможна
        ),
      ),
    ),
  );

  cloneCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cloneCollectionModal),
      switchMap(({ actionData }) =>
        from(this.electronService.cloneCollection(actionData.body)).pipe(
          map((clonecollectionResult) => {
            if (clonecollectionResult.isSuccess) {
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              this.dispatchSuccess('Коллекция успешно склонированна');
              return cloneCollectionModalSuccess({ clonedCollection: clonecollectionResult.body! });
            } else {
              this.dispatchFailure(clonecollectionResult.error!);
              return cloneCollectionModalFailure({ errorMessage: clonecollectionResult.error! });
            }
          }),
          catchError((err) => {
            const errorMessage = 'Непредвиденная ошибка при клонировании коллекций';
            this.dispatchFailure(errorMessage);
            return of(cloneCollectionModalFailure({ errorMessage: errorMessage }));
          }),
        ),
      ),
    ),
  );

  renameCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(renameCollectionModal),
      switchMap(({ actionData }) =>
        from(this.electronService.renameCollection(actionData.body)).pipe(
          map((renameCollectionResult) => {
            if (renameCollectionResult.isSuccess) {
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              this.dispatchSuccess('Коллекция успешно переименована');
              return renameCollectionModalSuccess({
                renamedCollection: renameCollectionResult.body!,
              });
            } else {
              this.dispatchFailure(renameCollectionResult.error!);
              return renameCollectionModalFailure({ errorMessage: renameCollectionResult.error! });
            }
          }),
          catchError((err) => {
            const errorMessage = 'Непредвиденная ошибка при переименовании коллекции';
            this.dispatchFailure(errorMessage);
            return of(renameCollectionModalFailure({ errorMessage: errorMessage }));
          }),
        ),
      ),
    ),
  );

  openCollectionInFS$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openCollectionInFS),
      debounceTime(300),
      distinctUntilChanged(),
      tap(({ collectionId }) =>
        this.electronService.openCollectionInFS({ collectionId: collectionId }),
      ),
    ),
  );

  deleteCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteCollectionModal),
      switchMap(({ actionData }) =>
        from(this.electronService.deleteCollection(actionData.body)).pipe(
          map((deleteCollectionResult) => {
            if (deleteCollectionResult.isSuccess) {
              this.dispatchCloseModal(actionData.modalOverlayRefs!);
              this.dispatchSuccess('Коллекция успешно удалена');
              return deleteCollectionModalSuccess({ newCollections: deleteCollectionResult.body! });
            } else {
              this.dispatchFailure(deleteCollectionResult.error!);
              return deleteCollectionModalFailure({ errorMessage: deleteCollectionResult.error! });
            }
          }),
          catchError((err) => {
            const errorMessage = 'Непредвиденная ошибка при удалении коллекции';
            this.dispatchFailure(errorMessage);
            return of(deleteCollectionModalFailure({ errorMessage: errorMessage }));
          }),
        ),
      ),
    ),
  );

  updateCollectionHeaders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCollectionHeaders),
      switchMap(({ updateDto }) => {
        const { collId, headers } = updateDto;
        return from(this.electronService.updateCollectionHeaders(collId, headers)).pipe(
          map((updateHeadersResult) => {
            if (updateHeadersResult.isSuccess) {
              this.dispatchSuccess('Заголовки успешно сохранены');
              return updateCollectionHeadersSuccess({ coll: updateHeadersResult.body! });
            } else {
              this.dispatchFailure(updateHeadersResult.error!);
              return updateCollectionHeadersFailure({ errorMessage: updateHeadersResult.error! });
            }
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при сохранении заголовков';
            this.dispatchFailure(errorMessage);
            return of(updateCollectionHeadersFailure({ errorMessage: errorMessage }));
          }),
        );
      }),
    ),
  );

  updateCollectionAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCollectionAuth),
      switchMap(({ updateDto }) => {
        const { collId, auth } = updateDto;
        return from(this.electronService.updateCollectionAuth(collId, auth)).pipe(
          map((updateAuthResult) => {
            if (updateAuthResult.isSuccess) {
              this.dispatchSuccess('Аутентификация успешно сохранена');
              return updateCollectionAuthSuccess({ coll: updateAuthResult.body! });
            } else {
              this.dispatchFailure(updateAuthResult.error!);
              return updateCollectionAuthFailure({ errorMessage: updateAuthResult.error! });
            }
          }),
          catchError(() => {
            const errorMessage = 'Непредвиденная ошибка при сохранении аутентификации';
            this.dispatchFailure(errorMessage);
            return of(updateCollectionAuthFailure({ errorMessage: errorMessage }));
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

  dispatchSuccess(successMessage: string) {
    this.store.dispatch(
      addAlertNotificationMessage({ message: { message: successMessage, showSuccess: true } }),
    );
  }

  dispatchFailure(errorMessage: string) {
    this.store.dispatch(
      addAlertNotificationMessage({ message: { message: errorMessage, showSuccess: false } }),
    );
  }
}
