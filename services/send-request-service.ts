import { Injectable } from "@angular/core";
import { RequestModel } from "../shared/models/requests/request";
import { AuthItem, BodyItem, HttpRequestModel } from "../shared/models/requests/http/http-request-model";
import axios, { AxiosBasicCredentials, AxiosRequestConfig } from "axios";
import { FileBody, FormUrlEncodedBody, JsonBody, MultipartBody, TextBody, XmlBody } from "../shared/models/requests/http/body";

type BuiltBody = {
  data?: unknown;
  headers?: Record<string, string>;
};

type BuiltAuth = {
  basicAuth?: AxiosBasicCredentials;
  headers?: Record<string, string>;
};


@Injectable({ providedIn: 'root'})
export class SendRequestService {

    private xmlParser: DOMParser = new DOMParser();

    sendRequest(req: RequestModel, selectedBody: BodyItem, selectedAuth: AuthItem){
        const config = this.buildAxiosConfig(req, selectedBody, selectedAuth);
        console.log(`Отправляем запрос по url ${req.url}`);
        return axios.request(config);
    }

    private buildAxiosConfig(request: HttpRequestModel, selectedBody: BodyItem, selectedAuth: AuthItem): AxiosRequestConfig {
        const activeBody =
            request.body[selectedBody.kind] ??
            request.body["none"];

        const activeAuth =
            request.auth[selectedAuth.kind] ??
            request.auth["none"];

        const builtBody = this.buildBody(activeBody);
        const buildAuth = this.buildAuth(activeAuth);

        const headers: Record<string, string> = {};

        for (const row of request.headers) {
            if (!row.isActive) continue;
            if (!row.name?.trim()) continue;
            headers[row.name] = row.value;
        }

        if (builtBody.headers) {
            Object.assign(headers, builtBody.headers);
        }

        const requestConfig : AxiosRequestConfig = {
            url: request.url,
            method: request.method.toLowerCase() as AxiosRequestConfig["method"],
            data:
                request.method === "GET" || request.method === "HEAD"
                    ? undefined
                    : builtBody.data
        }

        if(buildAuth.basicAuth) {
            requestConfig.auth = buildAuth.basicAuth;
        }

        if(buildAuth.headers) {
            Object.assign(headers, buildAuth.headers);
        }

        requestConfig.headers = headers;

        return requestConfig;
    }

    private buildAuth(auth: AuthItem) : BuiltAuth {
        switch (auth.kind) {
            case "none":
                return {};
            case "basic":
            
                if(auth.username && auth.password){
                    return {
                        basicAuth: { username: auth.username, password: auth.password }
                    }
                }
                return {};

            case "bearer":
            
                if(auth.token){
                    return {
                        headers: {
                            "Authorization": "Bearer "+ auth.token
                        }
                    }
                }
                return {};
            
            default:
                return {};
        }
    }

    private buildBody(body: BodyItem | undefined): BuiltBody {
        if (!body) return {};

        switch (body.kind) {
            case "none":
                return {};

            case "json": {
                const jsonBody = body as JsonBody;
                let data: string;
                try {
                    data = JSON.parse(jsonBody.value);
                } catch (error) {
                    console.log(`При отправке запроса, json является некорректным, поэтому скип`);
                    return {};
                }

                return {
                    data,
                    headers: {
                        "Content-Type": jsonBody.contentType,
                    },
                };
            }

            case "xml": {
                const xmlBody = body as XmlBody;
                const doc = this.xmlParser.parseFromString(xmlBody.value, "application/xml");

                console.log(`При отправке запроса спарсили xml, произошла ли ошибка? ${doc.getElementsByTagName('parsererror').length ? 
                'произошла' : "all good"}`);

                if(doc.getElementsByTagName('parsererror').length) {
                    return {};
                }
                else {
                    return {
                        data: xmlBody.value,
                        headers: {
                            "Content-Type": xmlBody.contentType,
                    },
                };
                }
                
            }

            case "text": {
                const textBody = body as TextBody;
                return {
                    data: textBody.value,
                    headers: {
                        "Content-Type": textBody.contentType,
                    },
                };
            }

            case "file": {
                const fileBody = body as FileBody;

                const activeFile = fileBody.files[0];

                if(activeFile && activeFile.fileInfo && activeFile.fileInfo!.fileValue){
                    console.log(`Нашли активный файл в file body: ${activeFile.fileInfo.fileValue.name}`);
                    return {
                        data: activeFile.fileInfo!.fileValue,
                        headers: {
                            "Content-Type": activeFile.fileInfo!.contentType!,
                        },
                    };
                }
                else {
                    console.log(`Нет активного файла в file body`);
                    return { };
                }
            }

            case "form-url-encoded": {
                const formBody = body as FormUrlEncodedBody;
                const params = new URLSearchParams();

                for (const row of formBody.fields) {
                    if (!row.isActive) continue;
                    if (!row.name?.trim()) continue;

                    params.append(row.name, row.value ?? "");
                }

                return {
                    data: params,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                };
            }

            case "multipart-form": {
                const multipartBody = body as MultipartBody;
                const formData = new FormData();

                for (const field of multipartBody.fields) {
                    if (!field.isActive) continue;
                    if (!field.key?.trim()) continue;

                    if (field.type === "file") {
                        if (field.contentType) {
                            const file = new File([field.file], field.file.name, {
                            type: field.contentType,
                            });
                            formData.append(field.key, file, field.file.name);
                        } else {
                            formData.append(field.key, field.file, field.file.name);
                        }
                    } else {
                        if (field.contentType) {
                            formData.append(
                            field.key,
                            new Blob([field.value], { type: field.contentType })
                            );
                        } else {
                            formData.append(field.key, field.value);
                        }
                    }
                }

                return {
                    data: formData,
                };
            }

            default:
                return {};
        }
    }

}