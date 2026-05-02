import { inject, Injectable } from "@angular/core";
import FormData from "form-data";
import { AuthItem, BodyItem, HttpConfigPayload, HttpRequestModel, TrackedRequest } from '../../shared/models/requests/http/http-request-model'
import { FileBody } from "../../shared/models/requests/http/body";
import { ResponseService } from '../response-service'
import { RequestModel } from "../../shared/models/requests/request";
import { v4 as uuidv4 } from 'uuid';
import { RequestElectronService } from "./request-electron-service";


type BuiltBody = {
  data?: any;
  headers?: Record<string, string>;
};

type BuiltAuth = {
  headers?: Record<string, string>;
};

@Injectable({ providedIn: 'root' })
export class SendRequestService {

    private responseService = inject(ResponseService)
    private requestElectronService = inject(RequestElectronService);

  async sendRequest(req: HttpRequestModel, selectedBody: BodyItem, selectedAuth: AuthItem) {
    const { body, headers } = this.buildHttpClientOptions(req, selectedBody, selectedAuth);

    console.log(`Отправляем запрос по url ${req.url}`);

    this.responseService.addStartedResponse(req);

    const response = await this.sendRequestByHttpMethod(req,
        body,
        headers
      );

    this.responseService.addFinishedResponse(response);

    return response;
  }

  private async sendRequestByHttpMethod(req: RequestModel,
    body: any,
    headers: Record<string, string>
  ): Promise<TrackedRequest> {

    const controllerId = uuidv4();

    const config: HttpConfigPayload = {
      method: req.method as any,
      url: req.url,
      headers,
      data: body,
      controllerId: controllerId,
      req: req
    };  

    const result = false ? await this.requestElectronService.sendRequest(config): JSON.parse(`{
          "body": "<asd> <message>Hello from server, content-type xml</message> </asd>",
          "error": null,
          "isSuccess": true,
          "isFailure": false
      }`);

    return {
      req,
      controllerId,
      result
    };
  }

  private buildHttpClientOptions(
    request: HttpRequestModel,
    selectedBody: BodyItem,
    selectedAuth: AuthItem
  ): { body?: any; headers: Record<string, string> } {

    const activeBody =
      request.body[selectedBody.kind] ??
      request.body["none"];

    const activeAuth =
      request.auth[selectedAuth.kind] ??
      request.auth["none"];

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
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : builtBody.data,
      headers
    };
  }

  private buildAuth(auth: AuthItem): BuiltAuth {
    switch (auth.kind) {
      case "basic":
        if (auth.username && auth.password) {
          const token = Buffer.from(`${auth.username}:${auth.password}`).toString("base64");
          return {
            headers: {
              Authorization: `Basic ${token}`
            }
          };
        }
        return {};

      case "bearer":
        if (auth.token) {
          return {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
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
      case "json":
        try {
          return {
            data: JSON.parse(body.value),
            headers: {
              "Content-Type": body.contentType
            }
          };
        } catch {
          console.log("Некорректный JSON");
          return {};
        }

      case "xml":
        return {
          data: body.value,
          headers: {
            "Content-Type": body.contentType
          }
        };

      case "text":
        return {
          data: body.value,
          headers: {
            "Content-Type": body.contentType
          }
        };

      case "file": {
            const fileBody = body as FileBody;
            const activeFile = fileBody.files[0];

            if (activeFile?.fileInfo?.fileValue) {
                return {
                    data: activeFile.fileInfo.fileValue,
                    headers: {
                        "Content-Type": activeFile.fileInfo.contentType!,
                    },
                };
            }

            console.log(`Файл не найден`);
            return {};
        }

      case "form-url-encoded": {
        const params = new URLSearchParams();

        for (const row of body.fields) {
          if (!row.isActive || !row.name?.trim()) continue;
          params.append(row.name, row.value ?? "");
        }

        return {
          data: params.toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        };
      }

      case "multipart-form": {
        const form = new FormData();

        for (const field of body.fields) {
          if (!field.isActive || !field.key?.trim()) continue;

          if (field.type === "file") {
            form.append(field.key, field.file, field.file.name);
          } else {
            form.append(field.key, field.value);
          }
        }

        return {
          data: form,
          headers: form.getHeaders()
        };
      }

      default:
        return {};
    }
  }
}