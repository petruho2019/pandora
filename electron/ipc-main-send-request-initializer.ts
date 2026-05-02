import { IpcMain } from "electron";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { buildFailureResultT, buildSuccessResultT, ResultT } from "../shared/models/result";
import { HttpConfigPayload } from "../shared/models/requests/http/http-request-model";
import { RequestModel } from "../shared/models/requests/request";

export function initializeSendRequest(ipcMain: IpcMain) {

    const controllers = new Map<string, AbortController>();

    // region send-request

    ipcMain.handle('send-request', async (event, configPayload: HttpConfigPayload) => {
        const controller = new AbortController();
        controllers.set(configPayload.controllerId, controller);

        try {
            const res = await axios.request({
                method: configPayload.method as any,
                url: configPayload.url,
                headers: configPayload.headers,
                data: configPayload.data,
                signal: controller.signal,
                validateStatus: () => true
            });

            return buildSuccessResultT(
                handleResponse(res, configPayload.req)!
            );

        } catch (err) {

            return buildFailureResultT(
                handleError(err, configPayload.req)
            );

        } finally {
            controllers.delete(configPayload.controllerId); 
        }
    });

    // region cancel-request

    ipcMain.handle('cancel-request', (_e, id: string | null) => {
        if(id) {
            controllers.get(id)!.abort();
            controllers.delete(id);
        }
    });


    // region functions

    function handleResponse(res: AxiosResponse<string>, req: RequestModel) {
        console.log("Response Status:", res.status);
        console.log("Response Status Text:", res.statusText);
        console.log("Response Headers:", res.headers);
        console.log("Response Config:", JSON.stringify(res.config, null, 2));
        console.log("Request URL:", res.config.url);
        console.log("Raw Response Data:", res.data);

        const contentType = String(res.headers?.["content-type"] ?? "").toLowerCase();

        let responseData: string = res.data;

        if (contentType.includes("application/json") || contentType.includes("+json")) {
            try {
                responseData = JSON.stringify(res.data, null, 2);
            } catch {
                responseData = res.data;
            }
        }

        return responseData;
    }

    function handleError(err: unknown, req: RequestModel) {

        if (axios.isCancel(err)) {
            return;
        }

        const errorMessage =
        err instanceof Error
            ? err.message
            : "Ошибка при отправке запроса";

        return errorMessage;
    }
}