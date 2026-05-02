import { Injectable } from "@angular/core";
import { CreateRequestInfo } from "../../shared/models/event-models/add-request-info";
import { RequestModel } from "../../shared/models/requests/request";
import { Result, ResultT } from "../../shared/models/result";
import { CloneRequestDto, DeleteRequestDto, LoadRequestDto, OpenRequestInFSDto, RenameRequestDto, UpdateRequestInfoDto } from "../../shared/models/requests/dto/request-dtos";
import {  AxiosResponse } from "axios";
import { HttpConfigPayload } from "../../shared/models/requests/http/http-request-model";

@Injectable({providedIn: 'root'})
export class RequestElectronService {

    createRequest({requestInfo}: { requestInfo: CreateRequestInfo}) : Promise<ResultT<RequestModel, string>> {
        return (window as any).electronAPI?.addRequest({ requestInfo: requestInfo});
    }

    loadRequests(collectionInfo: LoadRequestDto) : Promise<ResultT<RequestModel[], string>>{
        return (window as any).electronAPI?.loadRequests(collectionInfo);
    }

    renameRequest(requestInfo: RenameRequestDto): Promise<ResultT<RequestModel, string>>{
        return (window as any).electronAPI?.renameRequest(requestInfo);
    }

    cloneRequest(requestInfo: CloneRequestDto): Promise<ResultT<RequestModel, string>>{
        return (window as any).electronAPI?.cloneRequest(requestInfo);
    }

    openRequestInFS(requestInfo: OpenRequestInFSDto) : Promise<Result> {
        return (window as any).electronAPI?.openRequestInFS(requestInfo);
    };

    deleteRequest(requestInfo: DeleteRequestDto) : Promise<ResultT<RequestModel[], string>>{
        return (window as any).electronAPI?.deleteRequest(requestInfo);
    };

    updateRequest(reqInfo: UpdateRequestInfoDto) : Promise<ResultT<RequestModel, string>>{
        return (window as any).electronAPI?.updateRequest(reqInfo);
    }

    sendRequest(config: HttpConfigPayload) : Promise<ResultT<string, string>> {
        return (window as any).electronAPI?.sendRequest(config);
    }

    cancelRequest(controllerId: string | null) {
        (window as any).electronAPI?.cancelRequest(controllerId);
    }
}