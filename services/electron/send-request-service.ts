import { inject, Injectable } from '@angular/core';
import {
  AuthItem,
  BodyItem,
  CookieModel,
  HttpConfigPayload,
  HttpRequestModel,
  HttpResponseModelWrapper,
  TrackedRequest,
} from '../../shared/models/requests/http/http-request-model';
import {
  ElectronFilePayload,
  ElectronMultipartPayload,
  FileBody,
} from '../../shared/models/requests/http/body';
import { ResponseService } from '../response-service';
import { RequestModel } from '../../shared/models/requests/request';
import { v4 as uuidv4 } from 'uuid';
import { RequestElectronService } from './request-electron-service';
import { StopwatchService } from '../stopwatch-service';
import { Store } from '@ngrx/store';
import { addCookieModal } from '../../src/app/store/actions/modal-actions/cookie-modal.actions';

type BuiltBody = {
  data?: any;
  headers?: Record<string, string>;
};

type BuiltAuth = {
  headers?: Record<string, string>;
};

@Injectable({ providedIn: 'root' })
export class SendRequestService {
  private responseService = inject(ResponseService);
  private requestElectronService = inject(RequestElectronService);
  private stopwatchService = inject(StopwatchService);
  private store = inject(Store);

  async sendRequest(
    req: HttpRequestModel,
    selectedBody: BodyItem,
    selectedAuth: AuthItem,
    cookies: CookieModel[],
  ): Promise<HttpResponseModelWrapper> {
    const { body, headers, cookiesHeader } = this.buildHttpClientOptions(
      req,
      selectedBody,
      selectedAuth,
      cookies,
    );

    console.log(`Отправляем запрос по url ${req.url}`);

    const controllerId = uuidv4();

    this.responseService.addStartedResponse(req, controllerId);

    const response = await this.sendRequestByHttpMethod(
      req,
      body,
      headers,
      controllerId,
      cookiesHeader,
    );

    this.responseService.addFinishedResponse(response);

    if (response.responseResult.isSuccess) {
      this.handleResponseCookies(response.req.url, response.responseResult.body!.cookies);
    }

    return response;
  }

  private async sendRequestByHttpMethod(
    req: RequestModel,
    body: any,
    headers: Record<string, string>,
    controllerId: string,
    cookiesHeader: string,
  ): Promise<HttpResponseModelWrapper> {
    const config: HttpConfigPayload = {
      method: req.method as any,
      url: req.url,
      headers,
      data: body,
      controllerId: controllerId,
      req: req,
      cookiesHeader,
    };

    this.stopwatchService.start(req.id);

    const result = true
      ? await this.requestElectronService.sendRequest(config)
      : JSON.parse(`{
  "req": {
    "id": "0a836e78-9a56-497b-bb21-f6a58e3cdeed",
    "name": "asdasd",
    "auth": {
      "none": {
        "kind": "none",
        "name": "Без аутентификации"
      },
      "bearer": {
        "kind": "bearer",
        "name": "Bearer токен",
        "token": "asdasdasdasd"
      },
      "basic": {
        "kind": "basic",
        "name": "Базовая",
        "username": "asd",
        "password": "asd"
      }
    },
    "url": "http://localhost:5250/text",
    "type": "HTTP",
    "collectionId": "cc21cc73-dc46-469d-98d1-efe227863fd0",
    "method": "GET",
    "headers": [],
    "body": {
      "none": {
        "kind": "none",
        "group": "Other",
        "name": "Без тела"
      },
      "json": {
        "kind": "json",
        "contentType": "application/json",
        "group": "Raw",
        "name": "Json",
        "value": "asd"
      },
      "multipart-form": {
        "kind": "multipart-form",
        "name": "Составная форма",
        "fields": [
          {
            "id": "420d25df-e011-4409-8a64-e42f3890b45c",
            "type": "text",
            "key": "",
            "value": "",
            "isActive": true,
            "contentType": null
          }
        ],
        "group": "Form"
      },
      "file": {
        "kind": "file",
        "name": "Файл",
        "files": [],
        "group": "Other"
      }
    },
    "fileName": "asdasd",
    "params": []
  },
  "controllerId": "f5a876af-2ef8-4ce2-abc1-3e3e57cad7e6",
  "responseResult": {
    "body": {
      "status": 200,
      "statusText": "OK",
      "headers": {
        "content-length": "13",
        "content-type": "text/plain; charset=utf-8",
        "date": "Tue, 05 May 2026 20:13:40 GMT",
        "server": "Kestrel"
      },
      "body": "slkdfnhsl
      фыв
      фыв
      
      фыв
      
      фыв
      
      фыв
      
      фы
      в
      фы
      в
      фы
      в
      фы
      в
      ф
      ыв
      ф
      ыв
      
      фы
      в,jdf"
    },
    "error": null,
    "isSuccess": true,
    "isFailure": false
  }
}`);

    this.stopwatchService.stop(req.id);

    return result;
  }

  private buildHttpClientOptions(
    request: HttpRequestModel,
    selectedBody: BodyItem,
    selectedAuth: AuthItem,
    cookies: CookieModel[],
  ): { body?: any; headers: Record<string, string>; cookiesHeader: string } {
    const activeBody = request.body[selectedBody.kind] ?? request.body['none'];

    const activeAuth = request.auth[selectedAuth.kind] ?? request.auth['none'];

    const builtBody = this.buildBody(activeBody);
    const builtAuth = this.buildAuth(activeAuth);
    const cookiesHeader = this.buildCookiesHeader(cookies, request.url);

    const headers: Record<string, string> = {};

    for (const row of request.headers) {
      if (!row.isActive) continue;
      if (!row.name?.trim()) continue;

      headers[row.name] = row.value;
    }

    Object.assign(headers, builtBody.headers || {});
    Object.assign(headers, builtAuth.headers || {});

    return {
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : builtBody.data,
      headers,
      cookiesHeader,
    };
  }

  private buildAuth(auth: AuthItem): BuiltAuth {
    switch (auth.kind) {
      case 'basic':
        if (auth.username && auth.password) {
          const token = btoa(`${auth.username}:${auth.password}`);
          return {
            headers: {
              Authorization: `Basic ${token}`,
            },
          };
        }
        return {};

      case 'bearer':
        if (auth.token) {
          return {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          };
        }
        return {};

      default:
        return {};
    }
  }

  private handleResponseCookies(reqUrl: string, cookies: CookieModel[]) {
    let domain = '';

    try {
      domain = new URL(reqUrl).hostname;
    } catch {}

    for (const cookie of cookies) {
      const cookieToAdd: CookieModel = {
        ...cookie,
        domain: cookie.domain || domain,
      };

      this.store.dispatch(
        addCookieModal({
          actionData: {
            body: { cookie: cookieToAdd, fromServer: true },
            modalOverlayRefs: [],
          },
        }),
      );
    }
  }

  private buildBody(body: BodyItem | undefined): BuiltBody {
    if (!body) return {};

    switch (body.kind) {
      case 'json':
        try {
          return {
            data: JSON.parse(body.value),
            headers: {
              'Content-Type': body.contentType,
            },
          };
        } catch {
          console.log('Некорректный JSON');
          return {};
        }

      case 'xml':
        return {
          data: body.value,
          headers: {
            'Content-Type': body.contentType,
          },
        };

      case 'text':
        return {
          data: body.value,
          headers: {
            'Content-Type': body.contentType,
          },
        };

      case 'file': {
        const fileBody = body as FileBody;
        const activeFile = fileBody.files?.[0];
        const filePath = activeFile?.fileInfo?.path;

        if (!filePath) {
          console.log('Файл не выбран');
          return {};
        }

        return {
          data: {
            kind: 'file',
            path: filePath,
            contentType: activeFile.fileInfo?.contentType,
          } satisfies ElectronFilePayload,
          headers: {},
        };
      }

      case 'form-url-encoded': {
        const params = new URLSearchParams();

        for (const row of body.fields) {
          if (!row.isActive || !row.name?.trim()) continue;
          params.append(row.name, row.value ?? '');
        }

        return {
          data: params.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
      }

      case 'multipart-form': {
        return {
          data: {
            kind: 'multipart-form',
            fields: body.fields,
          } satisfies ElectronMultipartPayload,
          headers: {},
        };
      }

      default:
        return {};
    }
  }

  private buildCookiesHeader(cookies: CookieModel[], url: string): string {
    try {
      const urlObj = new URL(url);

      const cookiesJoined = cookies
        .filter((c) => c.domain === urlObj.hostname)
        .map((c) => `${encodeURIComponent(c.name)}=${c.value};`)
        .join(' ');

      console.log(`${cookiesJoined}`);

      return cookiesJoined;
    } catch (error) {
      return '';
    }
  }
}
