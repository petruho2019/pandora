import { IpcMain } from 'electron';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { buildFailureResultT, buildSuccessResultT, ResultT } from '../shared/models/result';
import {
  HttpConfigPayload,
  HttpResponseModel,
  HttpResponseModelWrapper,
} from '../shared/models/requests/http/http-request-model';
import { RequestModel } from '../shared/models/requests/request';
import * as fs from 'fs';
import * as path from 'path';
import { lookup } from 'mime-types';

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

        const res = await axios.request({
          method: configPayload.method as any,
          url: configPayload.url,
          headers: {
            ...(configPayload.headers || {}),
            ...(resolvedBody.headers || {}),
          },
          data: resolvedBody.data,
          signal: controller.signal,
          validateStatus: () => true,
        });

        console.log(`response: ${res.status}`);

        const resultResponseModel = handleResponse(res, configPayload.req)!;

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
    console.log(`cancel-request withId: ${id}`);
    if (id) {
      controllers.get(id)!.abort();
      controllers.delete(id);
    }
  });

  // region functions

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
    req: RequestModel,
  ): ResultT<HttpResponseModel, string> {
    console.log('Response Status:', res.status);
    console.log('Response Status Text:', res.statusText);
    console.log('Response Headers:', res.headers);
    console.log('Request URL:', res.config.url);
    console.log('Raw Response Data:', res.data);

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
