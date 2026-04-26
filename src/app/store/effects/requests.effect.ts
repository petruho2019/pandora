import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { inject } from '@angular/core';
import { loadRequests, loadRequestsFailure, loadRequestsSuccess, openRequestInFS, openRequestInFSFailure, openRequestInFSSuccess, updateRequest, updateRequestSuccess } from "../actions/requests.actions";
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, } from "rxjs/operators";
import { from, of,map } from "rxjs";
import { RequestElectronService } from "../../../../services/request-electron-service";
import { Store } from "@ngrx/store";
import { RequestModel } from "../../../../shared/models/requests/request";
import { selectLoadedByCollectionId } from "../selectors/requests.selector";
import { addAlertNotificationMessage } from "../actions/common.actions";
import { cloneRequest, cloneRequestFailure, cloneRequestSuccess, createHttpRequest, createRequestFailure, createRequestSuccess, deleteRequest, deleteRequestFailure, deleteRequestSuccess, renameRequest, renameRequestFailure, renameRequestSuccess } from "../actions/modal-actions/request-modal.actions";
import { OverlayRef } from "@angular/cdk/overlay";
import { closeModal } from "../actions/modal-actions/modal.actions";

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
                            if(actionData.modalOverlayRefs) {
                                this.dispatchCloseModal(actionData.modalOverlayRefs);
                            }
                            this.dispatchModalSuccess(actionData.successMessage!);
                            console.log(`addHttpRequestSuccess логирование объекта ${JSON.stringify(createRequestResult)}`);
                            return createRequestSuccess({request: createRequestResult.body!});
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
                        
                        this.dispatchCloseModal(actionData.modalOverlayRefs!);
                        this.dispatchModalSuccess('Запрос успешно переименован');
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
                        this.dispatchCloseModal(actionData.modalOverlayRefs!);
                        this.dispatchModalSuccess('Запрос успешно склонирован');
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

            return from(this.electronService.deleteRequest(actionData.body)).pipe(
                map((deleteRequestResult) => {
                    console.log(`deleteRequestResult ${JSON.stringify(deleteRequestResult)}`);
                    if(deleteRequestResult.isSuccess){
                        this.dispatchCloseModal(actionData.modalOverlayRefs!);
                        this.dispatchModalSuccess('Запрос успешно удален');
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

    updateRequest$ = createEffect(() => this.actions$.pipe(
        ofType(updateRequest),
        switchMap(( { actionData } ) => {
            return from(this.electronService.updateRequest(actionData.body)).pipe(
                map((updateRequestResult) => {
                    if(updateRequestResult.isSuccess){
                        this.dispatchCloseModal(actionData.modalOverlayRefs!);
                        this.dispatchModalSuccess('Запрос успешно сохранен');
                        return updateRequestSuccess({ req: updateRequestResult.body! });
                    }
                    else {
                        this.dispatchModalFailure(updateRequestResult.error!);
                        return deleteRequestFailure({errorMessage: updateRequestResult.error as string});
                    }
                }),
            catchError(err => {
                const errorMessage = "Непредвиденная ошибка при сохранении запроса"
                this.dispatchModalFailure(errorMessage)
                return of(deleteRequestFailure({errorMessage: errorMessage}))
            }))
        })
    ))

  dispatchCloseModal(modalOverlayRef: OverlayRef[]) {
    modalOverlayRef.forEach(ref => {
        this.store.dispatch( closeModal({ modalOverlay: ref }) );
    })
  }

  dispatchModalSuccess(successMessage: string){
    this.store.dispatch(addAlertNotificationMessage({message: { message: successMessage, showSuccess: true} }))
  }

  dispatchModalFailure(errorMessage: string){
    this.store.dispatch(addAlertNotificationMessage({message: { message: errorMessage, showSuccess: false} }))
  }
}