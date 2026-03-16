import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { inject } from '@angular/core';
import { cloneRequest, cloneRequestFailure, cloneRequestSuccess, createHttpRequest, createRequestFailure, createRequestSuccess, loadRequests, loadRequestsFailure, loadRequestsSuccess, openRequestInFS, openRequestInFSFailure, openRequestInFSSuccess, renameRequest, renameRequestFailure, renameRequestSuccess } from "../actions/requests.actions";
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap, } from "rxjs/operators";
import { HttpRequestModel } from "../../../../shared/models/requests/http-request-model";
import { CreateRequestError } from "../../../../shared/models/error/error";
import { from, of,map } from "rxjs";
import { RequestElectronService } from "../../../../services/request-electron-service";
import { Store } from "@ngrx/store";
import { RequestModel } from "../../../../shared/models/requests/request";
import { selectLoadedByCollectionId } from "../selectors/requests.selector";

export class RequestEffects {
    private actions$ = inject(Actions); 
    private electronService = inject(RequestElectronService);
    private store = inject(Store);

    addHttpRequest$ = createEffect(() => this.actions$.pipe(
        ofType(createHttpRequest),
        switchMap(({  requestInfo }) => 
            from(this.electronService.createRequest({ requestInfo: requestInfo})).pipe(
                    map(createRequestResult => {
                        if(createRequestResult.isSuccess)
                        {
                            console.log(`addHttpRequestSuccess логирование объекта ${JSON.stringify(createRequestResult)}`);
                            return createRequestSuccess({request: createRequestResult.body as HttpRequestModel});
                        }
                        else{
                            console.log(`addHttpRequestFailure логирование объекта ${JSON.stringify(createRequestResult)}`);
                            return createRequestFailure({error: createRequestResult.error as CreateRequestError});
                        }
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
                              else return loadRequestsFailure({errorMessage: loadRequestsResult.error as string})
                          }),
                catchError(err => of(loadRequestsFailure(err)))
            );
            }
        )
    ));

    renameRequest$ = createEffect(() => this.actions$.pipe(
        ofType(renameRequest),
        switchMap(({requestInfo: reqInfo}) => {
            return from(this.electronService.renameRequest(reqInfo)).pipe(
                map((renameRequestResult) => {
                    if(renameRequestResult.isSuccess) return renameRequestSuccess({renamedRequest: renameRequestResult.body as RequestModel })
                        else return renameRequestFailure({errorMessage: renameRequestResult.error as string});
                })
            )
        })
    ));

    cloneRequest = createEffect(() => this.actions$.pipe(
        ofType(cloneRequest),
        switchMap(({requestInfo}) => {
            return from(this.electronService.cloneRequest(requestInfo)).pipe(
                map((cloneRequestResult) => {
                    console.log(`Результат клонирования: ${JSON.stringify(cloneRequestResult)}`);
                    if(cloneRequestResult.isSuccess) return cloneRequestSuccess({clonedRequest: cloneRequestResult.body as RequestModel});
                    else return cloneRequestFailure({errorMessage: cloneRequestResult.error  as string})
                }),
                catchError((err) => of(cloneRequestFailure(err)))
            )
        })
    ));


    openRequestInFS = createEffect(() => this.actions$.pipe(
        ofType(openRequestInFS),
        debounceTime(300),        
        distinctUntilChanged(),
        switchMap(({ requestInfo }) =>{
            console.log(`Effect openRequestInFS`);
          return from(this.electronService.openRequestInFS(requestInfo)).pipe(
            map((openRequestInFsResult) => {
                console.log(`openRequestInFsResult ${JSON.stringify(openRequestInFsResult)}`);
                if(openRequestInFsResult.isFailure)
                    return openRequestInFSSuccess();
                else
                    return openRequestInFSFailure({errorMessage: openRequestInFsResult.errorMessage as string});
            }),
            catchError(err => of(openRequestInFSFailure({errorMessage: err}))
        ))
    })
    ));
}