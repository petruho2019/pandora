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
import { RequestModel, TableRow } from '../../shared/models/requests/request';
import { v4 as uuidv4 } from 'uuid';
import { RequestElectronService } from './request-electron-service';
import { StopwatchService } from '../stopwatch-service';
import { Store } from '@ngrx/store';
import { addCookieModal } from '../../src/app/store/actions/modal-actions/cookie-modal.actions';
import { Collection } from '../../shared/models/collections/collection';

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
    coll: Collection | undefined,
    selectedCollectionAuth: AuthItem,
  ): Promise<HttpResponseModelWrapper> {
    console.log(`Выбранная аутентификация коллекции: ${selectedCollectionAuth?.kind}`);

    const { body, headers, cookiesHeader } = this.buildHttpClientOptions(
      req,
      selectedBody,
      selectedAuth,
      cookies,
      coll,
      selectedCollectionAuth,
    );

    console.log(`выбранная аутентификация: ${JSON.stringify(selectedAuth, null, 2)}`);

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

    const result = await this.requestElectronService.sendRequest(config);

    this.stopwatchService.stop(req.id);

    return result;
  }

  private buildHttpClientOptions(
    request: HttpRequestModel,
    selectedBody: BodyItem,
    selectedAuth: AuthItem,
    cookies: CookieModel[],
    coll: Collection | undefined,
    selectedCollectionAuth: AuthItem,
  ): { body?: any; headers: Record<string, string>; cookiesHeader: string } {
    const activeBody = request.body[selectedBody.kind] ?? request.body['none'];

    const activeAuth = request.auth[selectedAuth.kind] ?? request.auth['none'];

    const builtBody = this.buildBody(activeBody);
    let builtAuth = this.buildAuth(activeAuth);
    const cookiesHeader = this.buildCookiesHeader(cookies, request.url);
    const collHeaders = this.buildCollHeaders(coll);

    if (!builtAuth.headers) builtAuth = this.buildAuth(selectedCollectionAuth);

    const headers: Record<string, string> = {};

    for (const row of request.headers) {
      if (!row.isActive) continue;
      if (!row.name?.trim()) continue;

      headers[row.name] = row.value;
    }

    Object.assign(headers, builtBody.headers || {});
    Object.assign(headers, builtAuth.headers || {});
    Object.assign(headers, collHeaders || {});

    return {
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : builtBody.data,
      headers,
      cookiesHeader,
    };
  }

  private buildAuth(auth: AuthItem): BuiltAuth {
    switch (auth?.kind) {
      case 'basic':
        if (auth.username && auth.password) {
          console.log(`Строим basic auth, ${auth.username}:${auth.password}`);
          const raw = `${auth.username}:${auth.password}`;
          const token = this.toBase64(raw);

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

      case 'inherit':
      case 'none':
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
        .filter((c) => urlObj.hostname === c.domain || urlObj.hostname.endsWith(`.${c.domain}`))
        .map((c) => `${encodeURIComponent(c.name)}=${c.value};`)
        .join(' ');

      return cookiesJoined;
    } catch (error) {
      return '';
    }
  }

  private buildCollHeaders(coll: Collection | undefined): Record<string, string> {
    if (!Boolean(coll)) return {};

    const headers = this.mapTableRowToHeaderRecord(
      coll?.collectionConfig.collectionSettings.headers ?? [],
    );

    return headers;
  }

  private mapTableRowToHeaderRecord(rows: TableRow[]): Record<string, string> {
    const headers: Record<string, string> = {};

    for (const row of rows) {
      if (Boolean(row.name) && row.isActive) headers[row.name] = row.value;
    }

    return headers;
  }

  private toBase64(txt: string) {
    const uint8Array = new TextEncoder().encode(txt);
    let binary = '';

    for (let i = 0; i < uint8Array.length; ++i) binary += String.fromCharCode(uint8Array[i]);

    return btoa(binary);
  }
}
