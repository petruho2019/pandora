import { IpcMain } from 'electron';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { buildFailureResultT, buildSuccessResultT, ResultT } from '../shared/models/result';
import {
  CookieModel,
  HttpConfigPayload,
  HttpResponseModel,
  HttpResponseModelWrapper,
} from '../shared/models/requests/http/http-request-model';
import { RequestModel } from '../shared/models/requests/request';
import * as fs from 'fs';
import * as path from 'path';
import { lookup } from 'mime-types';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';

type FilePayload = {
  kind: 'file';
  path: string;
  contentType?: string;
};

type MultipartPayload = {
  kind: 'multipart-form';
  fields: Array<{
    isActive: boolean;
    key: string;
    type: 'text' | 'file';
    value?: string;
    path?: string;
    contentType?: string;
  }>;
};

declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar;
  }
}

export function initializeSendRequest(ipcMain: IpcMain) {
  const controllers = new Map<string, AbortController>();

  // region send-request

  ipcMain.handle(
    'send-request',
    async (_event, configPayload: HttpConfigPayload): Promise<HttpResponseModelWrapper> => {
      const controller = new AbortController();
      controllers.set(configPayload.controllerId, controller);

      try {
        const resolvedBody = await resolveRequestBody(configPayload.data);

        const agent = new https.Agent();
        agent.options.rejectUnauthorized = false;

        const res = await axios.request({
          method: configPayload.method as any,
          url: configPayload.url,
          headers: {
            ...(configPayload.headers || {}),
            ...(resolvedBody.headers || {}),
            Cookie: configPayload.cookiesHeader,
          },
          data: resolvedBody.data,
          signal: controller.signal,
          httpsAgent: agent,
          validateStatus: () => true,
        });

        const cookies = (res.headers as any).getSetCookie();

        const resultResponseModel = handleResponse(res, parseCookies(cookies))!;

        return {
          req: configPayload.req,
          controllerId: configPayload.controllerId,
          responseResult: resultResponseModel,
        };
      } catch (err) {
        console.log(`Handle error in sendRequestElectron, ${err}`);
        return {
          req: configPayload.req,
          controllerId: configPayload.controllerId,
          responseResult: buildFailureResultT(handleError(err)!),
        };
      } finally {
        controllers.delete(configPayload.controllerId);
      }
    },
  );

  // region cancel-request

  ipcMain.handle('cancel-request', (_e, id: string | null) => {
    if (id) {
      controllers.get(id)!.abort();
      controllers.delete(id);
    }
  });

  // region functions

  function parseCookies(cookieStrings: string[]): CookieModel[] {
    return cookieStrings.map((cookieString) => {
      const parts = cookieString
        .split(';')
        .map((x) => x.trim())
        .filter(Boolean);

      const [nameValue, ...attributes] = parts;

      const [name = '', value = ''] = nameValue.split('=');

      const cookie: CookieModel = {
        id: uuidv4(),
        name,
        value,

        path: '/',
        domain: '',

        expiresAt: null,

        secure: false,
        httpOnly: false,
      };

      for (const attr of attributes) {
        const [rawKey, ...rawValue] = attr.split('=');

        const key = rawKey.toLowerCase().trim();
        const value = rawValue.join('=').trim();

        switch (key) {
          case 'path':
            cookie.path = value;
            break;

          case 'domain':
            cookie.domain = value;
            break;

          case 'expires':
            cookie.expiresAt = value || null;
            break;

          case 'max-age':
            cookie.expiresAt = new Date(Date.now() + Number(value) * 1000).toISOString();
            break;

          case 'secure':
            cookie.secure = true;
            break;

          case 'httponly':
            cookie.httpOnly = true;
            break;
        }
      }

      return cookie;
    });
  }

  async function resolveRequestBody(
    data: any,
  ): Promise<{ data: any; headers: Record<string, string> }> {
    if (!data) {
      return { data: undefined, headers: {} };
    }

    if (isFilePayload(data)) {
      await ensureFileExists(data.path);

      console.log(
        `ContentType that will set is: ${data.contentType ? data.contentType : lookup(data.path)}`,
      );

      return {
        data: fs.createReadStream(data.path),
        headers: {
          'Content-Type':
            (data.contentType ? data.contentType : lookup(data.path)) || 'application/octet-stream',
        },
      };
    }

    if (isMultipartPayload(data)) {
      const form = new FormData();

      for (const field of data.fields) {
        if (!field.isActive || !field.key?.trim()) continue;

        if (field.type === 'file') {
          if (!field.path) {
            throw new Error(`Не указан путь к файлу для поля "${field.key}"`);
          }

          await ensureFileExists(field.path);

          console.log(
            `ContentType that will set is: ${field.contentType ? field.contentType : lookup(field.path)}`,
          );

          form.append(field.key, fs.createReadStream(field.path), {
            filename: path.basename(field.path),
            contentType:
              (field.contentType ? field.contentType : lookup(field.path)) ||
              'application/octet-stream',
          });
        } else {
          form.append(field.key, field.value ?? '');
        }
      }

      return {
        data: form,
        headers: form.getHeaders(),
      };
    }

    return {
      data,
      headers: {},
    };
  }

  function isFilePayload(data: any): data is FilePayload {
    return data.kind === 'file';
  }

  function isMultipartPayload(data: any): data is MultipartPayload {
    return data.kind === 'multipart-form';
  }

  async function ensureFileExists(filePath: string) {
    try {
      const stats = await fs.promises.stat(filePath);

      if (!stats.isFile()) {
        throw new Error(`Выбрана папка, а не файл: ${filePath}`);
      }
    } catch (err: any) {
      if (err?.code === 'ENOENT') {
        throw new Error(`Файл не найден: ${filePath}`);
      }

      if (err?.code === 'EACCES') {
        throw new Error(`Нет доступа к файлу: ${filePath}`);
      }

      throw new Error(err?.message || `Ошибка проверки файла: ${filePath}`);
    }
  }

  function handleResponse(
    res: AxiosResponse<string>,
    cookies: CookieModel[],
  ): ResultT<HttpResponseModel, string> {
    console.log('Response Status:', res.status);
    console.log('Response Status Text:', res.statusText);
    console.log('Response Headers:', res.headers);
    console.log('Request URL:', res.config.url);
    console.log('Cookies:', cookies);

    let responseData: string = res.data;

    try {
      responseData = JSON.stringify(res.data, null, 2);
    } catch {
      console.log(`Response body is not json`);
    }

    return buildSuccessResultT({
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
      body: responseData,
      cookies: cookies,
    });
  }

  function handleError(err: any) {
    if (axios.isCancel(err)) {
      return 'Запрос отменен пользователем';
    }

    const errorMessage =
      err instanceof Error && err && err.message && err.message !== ''
        ? err.message
        : 'Ошибка при отправке запроса';

    return errorMessage;
  }
}
