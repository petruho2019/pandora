import { Injectable } from "@angular/core";
import { CreateRequestInfo } from "../shared/models/event-models/add-request-info";
import { RequestModel } from "../shared/models/requests/request";
import { ResultT } from "../shared/models/result";
import { CreateRequestError } from "../shared/models/error/error";
import { LoadRequestDto, RenameRequestDto } from "../shared/models/requests/dto/request-dtos";

@Injectable({providedIn: 'root'})
export class RequestElectronService {

    createRequest({requestInfo}: { requestInfo: CreateRequestInfo}) : Promise<ResultT<RequestModel, CreateRequestError>> {
        return (window as any).electronAPI?.addRequest({ requestInfo: requestInfo});
    }

    loadRequests(collectionInfo: LoadRequestDto) : Promise<ResultT<RequestModel[], string>>{
        return (window as any).electronAPI?.loadRequests(collectionInfo);
    }

    renameRequest(requestInfo: RenameRequestDto): Promise<ResultT<RequestModel, string>>{
        return (window as any).electronAPI?.renameRequest(requestInfo);
    }
}