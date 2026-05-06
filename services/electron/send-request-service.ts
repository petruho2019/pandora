import { inject, Injectable } from '@angular/core';
import FormData from 'form-data';
import {
  AuthItem,
  BodyItem,
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
import { FilesElectronService } from './files-electron-service';
import { getFileNameFromPath } from '../../src/app/app';
import { StopwatchService } from '../stopwatch-service';
import { ResultT } from '../../shared/models/result';

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
  private filesElectronService = inject(FilesElectronService);
  private stopwatchService = inject(StopwatchService);

  async sendRequest(req: HttpRequestModel, selectedBody: BodyItem, selectedAuth: AuthItem) {
    const { body, headers } = this.buildHttpClientOptions(req, selectedBody, selectedAuth);

    console.log(`Отправляем запрос по url ${req.url}`);

    const controllerId = uuidv4();

    this.responseService.addStartedResponse(req, controllerId);

    const response = await this.sendRequestByHttpMethod(req, body, headers, controllerId);

    this.responseService.addFinishedResponse(response);

    return response;
  }

  private async sendRequestByHttpMethod(
    req: RequestModel,
    body: any,
    headers: Record<string, string>,
    controllerId: string,
  ): Promise<HttpResponseModelWrapper> {
    const config: HttpConfigPayload = {
      method: req.method as any,
      url: req.url,
      headers,
      data: body,
      controllerId: controllerId,
      req: req,
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

    console.log(`Ответ на url: ${req.url}: ${JSON.stringify(result, null, 2)}`);

    return result;
  }

  private buildHttpClientOptions(
    request: HttpRequestModel,
    selectedBody: BodyItem,
    selectedAuth: AuthItem,
  ): { body?: any; headers: Record<string, string> } {
    const activeBody = request.body[selectedBody.kind] ?? request.body['none'];

    const activeAuth = request.auth[selectedAuth.kind] ?? request.auth['none'];

    const builtBody = this.buildBody(activeBody);
    const builtAuth = this.buildAuth(activeAuth);

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
}

// {                  Пример ответа когда ошибка
//   "req": {
//     "id": "36917f74-c09b-4575-a6fd-be68827369bf",
//     "name": "Без названия 2",
//     "auth": {
//       "none": {
//         "kind": "none",
//         "name": "Без аутентификации"
//       }
//     },
//     "url": "http://localhost:5250/test-form-file",
//     "type": "HTTP",
//     "collectionId": "cc21cc73-dc46-469d-98d1-efe227863fd0",
//     "method": "GET",
//     "headers": [],
//     "body": {
//       "none": {
//         "kind": "none",
//         "group": "Other",
//         "name": "Без тела"
//       },
//       "file": {
//         "kind": "file",
//         "name": "Файл",
//         "files": [
//           {
//             "id": "531e8a2c-bf95-4f6c-aab7-a8ffbd2ab2c8",
//             "isActive": true,
//             "name": "",
//             "value": "",
//             "fileInfo": {
//               "path": "C:\\Users\\vladg\\Downloads\\file1.txt",
//               "contentType": "1"
//             }
//           },
//           {
//             "id": "bd53d178-083e-41ab-95b1-8742151c5700",
//             "isActive": false,
//             "name": "",
//             "value": "",
//             "fileInfo": {
//               "path": "C:\\Users\\vladg\\Downloads\\file2.txt",
//               "contentType": "2"
//             }
//           }
//         ],
//         "group": "Other"
//       },
//       "multipart-form": {
//         "kind": "multipart-form",
//         "name": "Составная форма",
//         "fields": [
//           {
//             "id": "11557651-c9c9-49ff-bd6a-0c031ece5984",
//             "type": "file",
//             "key": "asd",
//             "path": "C:\\Users\\vladg\\Downloads\\file1.txt",
//             "isActive": true,
//             "contentType": null
//           },
//           {
//             "id": "80cada4e-55b5-4724-bd62-dc9756a04483",
//             "type": "text",
//             "key": "",
//             "value": "",
//             "isActive": true,
//             "contentType": null
//           }
//         ],
//         "group": "Form"
//       }
//     },
//     "fileName": "Без названия 2",
//     "params": []
//   },
//   "controllerId": "2bb19fc9-0c6d-4bb5-a957-7ebeb2b253e5",
//   "responseResult": {
//     "body": {
//       "status": 405,
//       "statusText": "Method Not Allowed",
//       "headers": {
//         "content-length": "0",
//         "date": "Tue, 05 May 2026 19:53:26 GMT",
//         "server": "Kestrel",
//         "allow": "POST"
//       },
//       "body": "\"\""
//     },
//     "error": null,
//     "isSuccess": true,
//     "isFailure": false
//   }
// }

// {                                  Пример ответа когда ОКЕЙ
//   "req": {
//     "id": "36917f74-c09b-4575-a6fd-be68827369bf",
//     "name": "Без названия 2",
//     "auth": {
//       "none": {
//         "kind": "none",
//         "name": "Без аутентификации"
//       }
//     },
//     "url": "http://localhost:5250/test-form-file",
//     "type": "HTTP",
//     "collectionId": "cc21cc73-dc46-469d-98d1-efe227863fd0",
//     "method": "POST",
//     "headers": [],
//     "body": {
//       "none": {
//         "kind": "none",
//         "group": "Other",
//         "name": "Без тела"
//       },
//       "file": {
//         "kind": "file",
//         "name": "Файл",
//         "files": [
//           {
//             "id": "531e8a2c-bf95-4f6c-aab7-a8ffbd2ab2c8",
//             "isActive": true,
//             "name": "",
//             "value": "",
//             "fileInfo": {
//               "path": "C:\\Users\\vladg\\Downloads\\file1.txt",
//               "contentType": "1"
//             }
//           },
//           {
//             "id": "bd53d178-083e-41ab-95b1-8742151c5700",
//             "isActive": false,
//             "name": "",
//             "value": "",
//             "fileInfo": {
//               "path": "C:\\Users\\vladg\\Downloads\\file2.txt",
//               "contentType": "2"
//             }
//           }
//         ],
//         "group": "Other"
//       },
//       "multipart-form": {
//         "kind": "multipart-form",
//         "name": "Составная форма",
//         "fields": [
//           {
//             "id": "11557651-c9c9-49ff-bd6a-0c031ece5984",
//             "type": "file",
//             "key": "asd",
//             "path": "C:\\Users\\vladg\\Downloads\\file1.txt",
//             "isActive": true,
//             "contentType": null
//           },
//           {
//             "id": "80cada4e-55b5-4724-bd62-dc9756a04483",
//             "type": "text",
//             "key": "",
//             "value": "",
//             "isActive": true,
//             "contentType": null
//           }
//         ],
//         "group": "Form"
//       }
//     },
//     "fileName": "Без названия 2",
//     "params": []
//   },
//   "controllerId": "b3a4a54b-2d5d-4dbf-ad27-d38f8b5b8426",
//   "responseResult": {
//     "body": {
//       "status": 200,
//       "statusText": "OK",
//       "headers": {
//         "content-type": "application/json; charset=utf-8",
//         "date": "Tue, 05 May 2026 19:54:23 GMT",
//         "server": "Kestrel",
//         "transfer-encoding": "chunked"
//       },
//       "body": "{\n  \"fileName\": \"file1.txt\",\n  \"contentType\": \"text/plain\",\n  \"length\": 0\n}"
//     },
//     "error": null,
//     "isSuccess": true,
//     "isFailure": false
//   }
// }
