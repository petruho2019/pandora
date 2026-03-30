import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { inject } from '@angular/core';
import { loadRequests, loadRequestsFailure, loadRequestsSuccess, openRequestInFS, openRequestInFSFailure, openRequestInFSSuccess } from "../actions/requests.actions";
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap, } from "rxjs/operators";
import { HttpRequestModel } from "../../../../shared/models/requests/http-request-model";
import { from, of,map } from "rxjs";
import { RequestElectronService } from "../../../../services/request-electron-service";
import { Store } from "@ngrx/store";
import { RequestModel } from "../../../../shared/models/requests/request";
import { selectLoadedByCollectionId } from "../selectors/requests.selector";
import { addAlertNotificationMessage } from "../actions/common.actions";
import { cloneRequest, cloneRequestFailure, cloneRequestSuccess, createHttpRequest, createRequestFailure, createRequestSuccess, deleteRequest, deleteRequestFailure, deleteRequestSuccess, renameRequest, renameRequestFailure, renameRequestSuccess } from "../actions/modal-actions/request-modal.actions";
import { OverlayRef } from "@angular/cdk/overlay";
import { modalSuccess } from "../actions/modal-actions/modal.actions";

export class RequestEffects {
    private actions$ = inject(Actions); 
    private electronService = inject(RequestElectronService);
    private store = inject(Store);

    addHttpRequest$ = createEffect(() => this.actions$.pipe(
        ofType(createHttpRequest),
        switchMap(({  actionData }) => 
            from(this.electronService.createRequest({ requestInfo: actionData.body})).pipe(
                    map(createRequestResult => {
                        if(createRequestResult.isSuccess)
                        {
                            this.dispatchModalSuccess(actionData.modalOverlayRef);
                            console.log(`addHttpRequestSuccess логирование объекта ${JSON.stringify(createRequestResult)}`);
                            return createRequestSuccess({request: createRequestResult.body as HttpRequestModel});
                        }
                        else{
                            console.log(`addHttpRequestFailure логирование объекта ${JSON.stringify(createRequestResult)}`);

                            this.dispatchModalFailure(createRequestResult.error!);
                            return createRequestFailure({errorMessage: createRequestResult.error!});
                        }
                    }),
                    catchError(err => {
                        const errorMessage = "Непредвиденная ошибка при добавлении запроса"
                        this.dispatchModalFailure(errorMessage)
                        return of(createRequestFailure({errorMessage: errorMessage}))
                    })           
                )
        )
    ));


    loadRequests$ = createEffect(() => this.actions$.pipe(
        ofType(loadRequests),
        concatLatestFrom(({collectionInfo: collInfo}) => this.store.select(selectLoadedByCollectionId({collectionId: collInfo.collectionId}))),
        filter(([action, isLoaded]) => !isLoaded),
        switchMap(([{collectionInfo: collectionInfo}, isLoaded]) => {
            return from(this.electronService.loadRequests({collectionId: collectionInfo.collectionId, collectionPath: collectionInfo.collectionPath})).pipe(
                map(loadRequestsResult => {
                              if(loadRequestsResult.isSuccess) return loadRequestsSuccess({loadedRequests: loadRequestsResult.body as RequestModel[], collectionId: collectionInfo.collectionId});
                              else{
                                this.dispatchModalFailure(loadRequestsResult.error!);

                                return loadRequestsFailure({errorMessage: loadRequestsResult.error as string});
                              }
                          }),
                catchError(err => {
                    const errorMessage = "Непредвиденная ошибка при загрузке запросов"
                    this.dispatchModalFailure(errorMessage)
                    return of(loadRequestsFailure({errorMessage: errorMessage}))
                })
            );
            }
        )
    ));

    renameRequest$ = createEffect(() => this.actions$.pipe(
        ofType(renameRequest),
        switchMap(({actionData}) => {
            return from(this.electronService.renameRequest(actionData.body)).pipe(
                map((renameRequestResult) => {
                    if(renameRequestResult.isSuccess) {
                        
                        this.dispatchModalSuccess(actionData.modalOverlayRef);
                        return renameRequestSuccess({renamedRequest: renameRequestResult.body as RequestModel });
                    }
                    else {
                        this.dispatchModalFailure(renameRequestResult.error!);
                        return renameRequestFailure({errorMessage: renameRequestResult.error!});
                    } 
                }),
                catchError(err => {
                    const errorMessage = "Непредвиденная ошибка при переименовании запроса"
                    this.dispatchModalFailure(errorMessage)
                    return of(renameRequestFailure({errorMessage: errorMessage}))
                })
            )
        })
    ));

    cloneRequest$ = createEffect(() => this.actions$.pipe(
        ofType(cloneRequest),
        switchMap(({ actionData }) => {
            return from(this.electronService.cloneRequest(actionData.body)).pipe(
                map((cloneRequestResult) => {
                    console.log(`Результат клонирования: ${JSON.stringify(cloneRequestResult)}`);
                    if(cloneRequestResult.isSuccess) {
                        this.dispatchModalSuccess(actionData.modalOverlayRef);
                        return cloneRequestSuccess({clonedRequest: cloneRequestResult.body as RequestModel});
                    }
                    else {
                        console.log(`else в cloneRequest$`);
                        this.dispatchModalFailure(cloneRequestResult.error!);
                        return cloneRequestFailure({errorMessage: cloneRequestResult.error!})
                    } 
                }),
                catchError((err) => {
                    const errorMessage = "Непредвиденная ошибка при клонировании запроса"
                    this.dispatchModalFailure(errorMessage)
                    return of(cloneRequestFailure({errorMessage: errorMessage}))
                })
            )
        })
    ));


    openRequestInFS$ = createEffect(() => this.actions$.pipe(
        ofType(openRequestInFS),
        debounceTime(300),        
        distinctUntilChanged(),
        switchMap(({ requestInfo }) =>{
            console.log(`Effect openRequestInFS`);
          return from(this.electronService.openRequestInFS(requestInfo)).pipe(
            map((openRequestInFsResult) => {
                console.log(`openRequestInFsResult ${JSON.stringify(openRequestInFsResult)}`);
                if(openRequestInFsResult.isSuccess)
                    return openRequestInFSSuccess();
                else{
                    this.dispatchModalFailure(openRequestInFsResult.errorMessage!);
                    return openRequestInFSFailure({errorMessage: openRequestInFsResult.errorMessage as string});
                }
            }),
            catchError(err => {
                const errorMessage = "Непредвиденная ошибка при открытии запроса в файловой системе"
                this.dispatchModalFailure(errorMessage)
                return of(openRequestInFSFailure({errorMessage: errorMessage}))
            }
        ))
    })));

    deleteRequest$ = createEffect(() => this.actions$.pipe(
        ofType(deleteRequest),
        switchMap(( { actionData } ) => {
            console.log(`Удаление запроса ${actionData.body} в effect!`);

            return from(this.electronService.deleteRequest(actionData.body)).pipe(
                map((deleteRequestResult) => {
                    console.log(`deleteRequestResult ${JSON.stringify(deleteRequestResult)}`);
                    if(deleteRequestResult.isSuccess){
                        this.dispatchModalSuccess(actionData.modalOverlayRef);
                        return deleteRequestSuccess({ newRequests: deleteRequestResult.body! });
                    }

                    else{
                        this.dispatchModalFailure(deleteRequestResult.error!);
                        return deleteRequestFailure({errorMessage: deleteRequestResult.error as string});
                    }
                }),
            catchError(err => {
                const errorMessage = "Непредвиденная ошибка при удалении запроса"
                this.dispatchModalFailure(errorMessage)
                return of(deleteRequestFailure({errorMessage: errorMessage}))
            }))
        })
    ))



  dispatchModalSuccess(modalOverlayRef: OverlayRef) {
    this.store.dispatch( modalSuccess({ modalOverlay: modalOverlayRef }) );
  }

  dispatchModalFailure(errorMessage: string){
    console.log(`Диспатчим ошибку: ${errorMessage}`);
    this.store.dispatch(addAlertNotificationMessage({message: errorMessage}))
  }
}