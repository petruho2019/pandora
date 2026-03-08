import { ElectronService } from "../../services/electron-service";
import { catchError, EMPTY, exhaustMap, from, map, of, switchMap } from "rxjs";

import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { addCollection, addCollectionSuccess, cloneCollection, cloneCollectionFailure, cloneCollectionSuccess, loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollection, openCollectionCancel, openCollectionFailure, openCollectionSuccess, removeCollection, removeCollectionFailure, removeCollectionSuccess, renameCollection, renameCollectionFailure, renameCollectionSuccess } from '../actions/collections.actions';
import { Collection } from "../../../../shared/models/collections/collection";
import { CloneCollectionDto } from "../../../../shared/models/collections/dto/collection-action-dtos";


export class CollectionEffects {
  private actions$ = inject(Actions); 
  private electronService = inject(ElectronService);

  loadCollections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCollections),
      switchMap(() =>
        from(this.electronService.loadCollections()).pipe(
          map((colls) => {
            const collectionsArray = Array.isArray(colls) ? colls : [];

            const prepared: Collection[] = collectionsArray.map(c => ({
              ...c,
              requests: c.requests ?? []
            }));
            return loadCollectionsSuccess({ collections: prepared });
          }),
          catchError(error =>
            of(loadCollectionsFailure({ error: error.message }))
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
          map(collection =>{
            console.log(`Collection successfully added`);
            return addCollectionSuccess({ collection })
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
          map(collection => openCollectionSuccess({collection})),
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
        map(collection => cloneCollectionSuccess({ clonedCollection: collection })),
        catchError((err) => of(cloneCollectionFailure({ errorMessage: err })))
      )
    )
  ));


  renameCollection = createEffect(() => this.actions$.pipe(
    ofType(renameCollection),
    switchMap(({ collectionInfo }) =>
      from(this.electronService.renameCollection(collectionInfo)).pipe(
        map(collection => renameCollectionSuccess({ renamedCollection: collection })),
        catchError((err) => of(renameCollectionFailure({ errorMessage: err })))
      )
    )
  ));

}