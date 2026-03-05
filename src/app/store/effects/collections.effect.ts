import { ElectronService } from "../../services/electron-service";
import { catchError, EMPTY, exhaustMap, from, map, mergeMap, of, switchMap, tap } from "rxjs";

import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects'; // ← Actions из effects!
import { addCollection, addCollectionSuccess, closeCollection, closeCollectionFailure, closeCollectionSuccess, loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollection, openCollectionCancel, openCollectionFailure, openCollectionSuccess } from '../actions/collections.actions';
import { CollectionEntity } from "../../../../shared/models/entitys/collection-entity";
import { Collection } from "../../../../shared/models/collections/collection";

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
          map(collection =>
            addCollectionSuccess({ collection })
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

  closeCollection = createEffect(() => this.actions$.pipe(
      ofType(closeCollection),
      switchMap(({collectionId}) => 
        from(this.electronService.closeCollection(collectionId)).pipe(
          map(collections => closeCollectionSuccess({collections})),
          catchError(() => of(closeCollectionFailure({errorMessage: `Ошибка при закрытии коллекции`}))) // Скорее всего невозможна
        )
      )
    )
  );
}