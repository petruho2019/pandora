import { computed, inject, Injectable, signal } from '@angular/core';
import { RequestModel } from '../shared/models/requests/request';
import {
  HttpRequestModel,
  HttpResponseModelWrapper,
  ResponseState,
  TrackedRequest,
} from '../shared/models/requests/http/http-request-model';
import { RequestElectronService } from './electron/request-electron-service';
import { StopwatchService } from './stopwatch-service';
import { ResultT } from '../shared/models/result';

@Injectable({ providedIn: 'root' })
export class ResponseService {
  private requestElectronService = inject(RequestElectronService);
  private stopWatchService = inject(StopwatchService);

  private _responses = signal<Record<string, ResponseState>>({});
  public responses = this._responses.asReadonly();

  addStartedResponse(req: HttpRequestModel, controllerId: string) {
    this._responses.update((current) => ({
      ...current,
      [req.id]: {
        req,
        responseModel: null,
        controllerId: controllerId,
        isFinished: false,
        isSended: true,
        isFailure: false,
        error: null,
        time: null,
      },
    }));
  }

  addFinishedResponse(responseWrapper: HttpResponseModelWrapper) {
    const { req, responseResult } = responseWrapper;

    if (responseResult.isFailure) {
      this._responses.update((current) => {
        const prev = current[req.id];

        return {
          ...current,
          [req.id]: {
            ...prev,
            req: { ...req },
            responseModel: null,
            isFinished: true,
            isSended: false,
            isFailure: responseResult.isFailure,
            error: responseResult.error,
          },
        };
      });

      return;
    }

    this._responses.update((current) => ({
      ...current,
      [req.id]: {
        ...current[req.id],
        req,
        responseModel: responseResult.body!,
        isFinished: true,
        isSended: false,
        isFailure: false,
        error: null,
        time: this.stopWatchService.getSpentTime(req.id),
      },
    }));
  }

  cancelRequest(req: RequestModel) {
    const current = this._responses()[req.id];
    if (!current) return;

    console.log(`Отменяем запрос: ${JSON.stringify(this._responses()[req.id])}`);

    this.requestElectronService.cancelRequest(this._responses()[req.id]?.controllerId);

    this._responses.update((responses) => ({
      ...responses,
      [req.id]: {
        ...responses[req.id],
        isFinished: true,
        isSended: false,
        isFailure: true,
        error: 'Отменено пользователем',
      },
    }));

    this.stopWatchService.stop(req.id);
  }

  isReqSended(id: string) {
    const item = this._responses()[id];
    return !!item && !item.isFinished && item.isSended;
  }
}
