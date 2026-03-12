import { CollectionElectronService } from "../../../../services/collection-electron-service";
import { catchError, debounceTime, distinctUntilChanged, EMPTY, exhaustMap, from, map, of, switchMap, tap } from "rxjs";

import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { addCollection, addCollectionFailure, addCollectionSuccess, cloneCollection, cloneCollectionFailure, cloneCollectionSuccess, loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollection, openCollectionCancel, openCollectionFailure, openCollectionInFS, openCollectionSuccess, removeCollection, removeCollectionFailure, removeCollectionSuccess, renameCollection, renameCollectionFailure, renameCollectionSuccess } from '../actions/collections.actions';
import { Collection } from "../../../../shared/models/collections/collection";
import { CloneCollectionDto } from "../../../../shared/models/collections/dto/collection-action-dtos";


export class CollectionEffects {
  private actions$ = inject(Actions); 
  private electronService = inject(CollectionElectronService);

  loadCollections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCollections),
      switchMap(() =>
        from(this.electronService.loadCollections()).pipe(
          map((colls) => {
            return loadCollectionsSuccess({ collections: colls });
          }),
          catchError(error =>
            of(loadCollectionsFailure({ errorMessage: error.message }))
          )
        )
      )
    )
  );

  addCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCollection),
      switchMap(({ name, path }) =>
        from(this.electronService.addCollection({ name, path })).pipe(
          map(addCollectionResult =>{
            if(addCollectionResult.isSuccess)  return addCollectionSuccess({ collection: addCollectionResult.body as Collection });
            else return addCollectionFailure({errorMessage: addCollectionResult.error});
          }
          ),
          catchError(err => {
            console.error(err);
            return EMPTY;
          })
        )
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
            if(openCollectionResult.isSuccess) return openCollectionSuccess({collection: openCollectionResult.body as Collection});
            else return openCollectionFailure({errorMessage: openCollectionResult.error});
      }),
          catchError(err => {
            console.error(err);
            return of(openCollectionFailure(err));
          })
        )
      })
    )
  )

  removeCollection = createEffect(() => this.actions$.pipe(
      ofType(removeCollection),
      switchMap(({collectionId}) => 
        from(this.electronService.removeCollection(collectionId)).pipe(
          map(collections => removeCollectionSuccess({collections})),
          catchError(() => of(removeCollectionFailure({errorMessage: `Ошибка при удалении коллекции`}))) // Скорее всего невозможна
        )
      )
    )
  );

  cloneCollection = createEffect(() => this.actions$.pipe(
      ofType(cloneCollection),
      switchMap(({ collectionInfo }) =>
        from(this.electronService.cloneCollection(collectionInfo)).pipe(
          map(clonecollectionResult => {
              if(clonecollectionResult.isSuccess) return cloneCollectionSuccess({clonedCollection: clonecollectionResult.body as Collection});
              else return cloneCollectionFailure({errorMessage: clonecollectionResult.error as string})
          }),
          catchError((err) => of(cloneCollectionFailure({ errorMessage: err })))
        )
      )
    )
  );


  renameCollection = createEffect(() => this.actions$.pipe(
    ofType(renameCollection),
    switchMap(({ collectionInfo }) =>
      from(this.electronService.renameCollection(collectionInfo)).pipe(
        map(renameCollectionResult => {
              if(renameCollectionResult.isSuccess) return renameCollectionSuccess({renamedCollection: renameCollectionResult.body as Collection});
              else return renameCollectionFailure({errorMessage: renameCollectionResult.error as string})
          }),
        catchError((err) => of(renameCollectionFailure({ errorMessage: err })))
      )
    )
  ));


  openCollectionInFS = createEffect(() => this.actions$.pipe(
    ofType(openCollectionInFS),
    debounceTime(300),        
    distinctUntilChanged(),
    tap(({ collectionId }) =>
      this.electronService.openCollectionInFS({collectionId: collectionId})
    )
  ));

}