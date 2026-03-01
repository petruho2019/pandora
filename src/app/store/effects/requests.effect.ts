import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ElectronService } from "../../services/electron-service";
import { inject } from '@angular/core';
import { createHttpRequest, createRequestFailure, createRequestSuccess } from "../actions/requests.actions";
import { map, switchMap, tap } from "rxjs/operators";
import { HttpRequestModel } from "../../../../shared/models/requests/http-request-model";
import { CreateRequestError } from "../../../../shared/models/error/error";
import { from } from "rxjs";

export class RequestEffects {
    private actions$ = inject(Actions); 
    private electronService = inject(ElectronService);

    addHttpRequest$ = createEffect(() => this.actions$.pipe(
        ofType(createHttpRequest),
        switchMap(({ collectionPath, requestInfo }) => 
            from(this.electronService.createRequest({collectionPath: collectionPath, requestInfo: requestInfo})).pipe(
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
}