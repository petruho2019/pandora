import { inject, Injectable, signal } from "@angular/core";
import { RequestModel } from "../shared/models/requests/request";
import { HttpRequestModel, ResponseState, TrackedRequest } from "../shared/models/requests/http/http-request-model";
import { RequestElectronService } from "./electron/request-electron-service";


@Injectable({ providedIn: 'root'})
export class ResponseService {

    private requestElectronService = inject(RequestElectronService);

    private _responses = signal<Record<string, ResponseState>>({});

    public responses = this._responses.asReadonly();

    addStartedResponse(req: HttpRequestModel) {
        this._responses.update(current => ({
            ...current,
            [req.id]: {
                req,
                responseData: null,
                controllerId: null,
                isFinished: false,
                isSended: true,
                isFailure: false,
                error: null
            }
        }));

        console.log(`Запрос на url: ${req.url} отправлен`);
    }

    addFinishedResponse(tracked: TrackedRequest) {

        const { req, result, controllerId } = tracked;

        if(tracked.result.isFailure) {
            this._responses.update(current => {
                const prev = current[req.id];

                return {
                    ...current,
                    [req.id]: {
                    ...prev, 
                    req: { ...req },
                    responseData: tracked.result.error,
                    controllerId,
                    isFinished: true,
                    isSended: false,
                    isFailure: tracked.result.isFailure,
                    error: tracked.result.error
                    }
                };
            });

            return;
        }

        this._responses.update(current => ({
            ...current,
            [req.id]: {
                req,
                responseData: tracked.result.body,
                controllerId,
                isFinished: true,
                isSended: false,
                isFailure: false,
                error: null,
            }
        }));
    }

    cancelRequest(req: RequestModel) {
        const current = this._responses()[req.id];
        if (!current) return;

        this.requestElectronService.cancelRequest(this._responses()[req.id]?.controllerId);

        this._responses.update(responses => ({
        ...responses,
        [req.id]: {
            ...responses[req.id],
            isFinished: true,
            isSended: false,
            error: "Отменено пользователем"
        }
        }));
    }

    isReqSended(id: string) {
        const item = this._responses()[id];
        return !!item && !item.isFinished && item.isSended;
    }
}