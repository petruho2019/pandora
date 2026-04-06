import { CollectionElectronService } from "../../../../services/collection-electron-service";
import { catchError, debounceTime, distinctUntilChanged, exhaustMap, from, map, of, switchMap, tap } from "rxjs";
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {  loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollection, openCollectionCancel, openCollectionFailure, openCollectionInFS, openCollectionSuccess} from '../actions/collections.actions';
import { addCollectionModal, addCollectionModalFailure, addCollectionModalSuccess, cloneCollectionModal, cloneCollectionModalFailure, cloneCollectionModalSuccess, closeCollectionModal, closeCollectionModalFailure, closeCollectionModalSuccess, deleteCollectionModal, deleteCollectionModalFailure, deleteCollectionModalSuccess, renameCollectionModal, renameCollectionModalFailure, renameCollectionModalSuccess } from "../actions/modal-actions/collections-modal.actions";
import { modalSuccess } from "../actions/modal-actions/modal.actions";
import { Store } from "@ngrx/store";
import { OverlayRef } from "@angular/cdk/overlay";
import { addAlertNotificationMessage } from "../actions/common.actions";


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
          catchError(error =>{
            const errorMessage = "Непредвиденная ошибка при загрузке коллекций";
            this.store.dispatch(addAlertNotificationMessage({message: errorMessage}))
            return of(loadCollectionsFailure({ errorMessage: errorMessage }));
          }
          )
        )
      )
    )
  );

  addCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCollectionModal),
      switchMap(({ actionData }) =>
        from(this.electronService.addCollection(actionData.body)).pipe(
          map(addCollectionResult =>{
            if(addCollectionResult.isSuccess){
              console.log(`Добавление коллекции прошло успешно`);
              this.dispatchModalSuccess(actionData.modalOverlayRef);
              return addCollectionModalSuccess({ addedCollection: addCollectionResult.body! });
            }  
            else {
              this.dispatchModalFailure(addCollectionResult.error!);
              return addCollectionModalFailure({errorMessage: addCollectionResult.error!});
            }
          }),
          catchError(err => {
            const errorMessage = "Непредвиденная ошибка при добавлении коллекций";
            this.store.dispatch(addAlertNotificationMessage({message: errorMessage}))
            return of(addCollectionModalFailure({ errorMessage: errorMessage }));
          }))
        )
      )
  );

  openCollection$ = createEffect(() => 
    this.actions$.pipe(
      ofType(openCollection),
      exhaustMap(() => {
        console.log(`Open collection , select folder`);
        return from(this.electronService.selectFolder()).pipe(
          map(path => ({path})),
          catchError(err => { 
            console.error('Диалог закрыт или ошибка', err);
            return of({path: null}); 
          })
        )
      }
        
      ),
      switchMap(({path}) => {
        console.log(`Selected folder: ${path}`);

        if (!path) {
          return of(openCollectionCancel());
        }

        return from(this.electronService.openCollection({collectionPath: path})).pipe(
          map(openCollectionResult => {
            if(openCollectionResult.isSuccess) return openCollectionSuccess({collection: openCollectionResult.body!});
            else {
              this.dispatchModalFailure(openCollectionResult.error!);
              return openCollectionFailure({errorMessage: openCollectionResult.error});
            }
          }),
          catchError(err => {
            const errorMessage = "Непредвиденная ошибка при открытии коллекций";
            this.store.dispatch(addAlertNotificationMessage({message: errorMessage}))
            return of(openCollectionFailure({ errorMessage: errorMessage }));
          }));
        })
      )
    );

  removeCollection$ = createEffect(() => this.actions$.pipe(
      ofType(closeCollectionModal),
      switchMap(({ actionData }) => 
        from(this.electronService.removeCollection(actionData.body.collectionId)).pipe(
          map(collections => {
            this.dispatchModalSuccess(actionData.modalOverlayRef);
            return closeCollectionModalSuccess({ newCollections: collections })
          }),
          catchError(() => {
            const errorMessage = "Непредвиденная ошибка при удалении коллекций";
            this.store.dispatch(addAlertNotificationMessage({message: errorMessage}))
            return of(closeCollectionModalFailure({ errorMessage: errorMessage }));
          }) // Скорее всего невозможна
        )
      )
    )
  );

  cloneCollection$ = createEffect(() => this.actions$.pipe(
      ofType(cloneCollectionModal),
      tap(() => { console.log(`CloneCollectionEffect!!`); }),
      switchMap(({ actionData }) =>
        from(this.electronService.cloneCollection(actionData.body)).pipe(
          map(clonecollectionResult => {
            console.log(`Clone result ${JSON.stringify(clonecollectionResult)}`);
              if(clonecollectionResult.isSuccess){
                this.dispatchModalSuccess(actionData.modalOverlayRef);
                return cloneCollectionModalSuccess( {clonedCollection: clonecollectionResult.body!} );
              } 
              else {
                this.dispatchModalFailure(clonecollectionResult.error!);
                return cloneCollectionModalFailure({errorMessage: clonecollectionResult.error!});
              }
          }),
          catchError((err) => {
            const errorMessage = "Непредвиденная ошибка при клонировании коллекций";
            this.store.dispatch(addAlertNotificationMessage({message: errorMessage}))
            return of(cloneCollectionModalFailure({ errorMessage: errorMessage }));
          })
        )
      )
    )
  );


  renameCollection$ = createEffect(() => this.actions$.pipe(
    ofType(renameCollectionModal),
    switchMap(({ actionData }) =>
      from(this.electronService.renameCollection(actionData.body)).pipe(
        map(renameCollectionResult => {
              if(renameCollectionResult.isSuccess){
                this.dispatchModalSuccess(actionData.modalOverlayRef);
                return renameCollectionModalSuccess({renamedCollection: renameCollectionResult.body!});
              } 
              else {
                this.dispatchModalFailure(renameCollectionResult.error!);
                return renameCollectionModalFailure({errorMessage: renameCollectionResult.error!})
              }
          }),
        catchError((err) => {
            const errorMessage = "Непредвиденная ошибка при переименовании коллекции";
            this.dispatchModalFailure(errorMessage);
            return of(renameCollectionModalFailure({ errorMessage: errorMessage }));
          })
      )
    )
  ));


  openCollectionInFS$ = createEffect(() => this.actions$.pipe(
    ofType(openCollectionInFS),
    debounceTime(300),        
    distinctUntilChanged(),
    tap(({ collectionId }) =>
      this.electronService.openCollectionInFS({collectionId: collectionId})
    )
  ));

  deleteCollection$ = createEffect(() => this.actions$.pipe(
    ofType(deleteCollectionModal),
    switchMap(({actionData}) => from(this.electronService.deleteCollection(actionData.body)).pipe(
        map(deleteCollectionResult => {
          console.log(`Effect из удаление коллекции: ${JSON.stringify(deleteCollectionResult, null , 2)}`);

              if(deleteCollectionResult.isSuccess){
                this.dispatchModalSuccess(actionData.modalOverlayRef);
                return deleteCollectionModalSuccess({newCollections: deleteCollectionResult.body!});
              } 
              else {
                this.dispatchModalFailure(deleteCollectionResult.error!);
                return deleteCollectionModalFailure({errorMessage: deleteCollectionResult.error!})
              }
          }),
        catchError((err) => {
            const errorMessage = "Непредвиденная ошибка при удалении коллекции";
            this.dispatchModalFailure(errorMessage);
            return of(deleteCollectionModalFailure({ errorMessage: errorMessage }));
          })
      )
    )
  )); //

  dispatchModalSuccess(modalOverlayRef: OverlayRef) {
    this.store.dispatch( modalSuccess({ modalOverlay: modalOverlayRef }) );
  }

  dispatchModalFailure(errorMessage: string){
    this.store.dispatch(addAlertNotificationMessage({message: errorMessage}))
  }
}