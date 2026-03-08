import { Injectable } from "@angular/core";
import { CreateRequestInfo } from "../../../shared/models/event-models/add-request-info";
import { buildFailureResultT, buildSuccessResultT, ResultT } from '../../../shared/models/result'
import { Collection } from "../../../shared/models/collections/collection";
import { RequestModel } from "../../../shared/models/requests/request";
import { CreateRequestError } from "../../../shared/models/error/error";
import { CloneCollectionDto, RenameCollectionDto } from "../../../shared/models/collections/dto/collection-action-dtos";

@Injectable({ providedIn: 'root'})
export class ElectronService {

    addCollection( {name, path} : { name: string; path: string; } ) : Promise<Collection>{
        return (window as any).electronAPI?.addCollection({ collectionName: name, collectionPath: path });
    };
    loadCollections(): Collection[] {
        return (window as any).electronAPI?.loadCollections();
    };
    openCollection({collectionPath}: {collectionPath: string}) : Promise<Collection> {
        return (window as any).electronAPI?.openCollection(collectionPath);
    };
    removeCollection(collectionId: string) : Promise<Collection[]>{
        return (window as any).electronAPI?.removeCollection(collectionId);
    };
    cloneCollection(collectionInfo: CloneCollectionDto) : Promise<Collection>{
        return (window as any).electronAPI?.cloneCollection(collectionInfo);
    };
    renameCollection(collectionInfo: RenameCollectionDto) : Promise<Collection>{
        return (window as any).electronAPI?.renameCollection(collectionInfo);
    };

    createRequest({collectionPath, requestInfo}: {collectionPath: string, requestInfo: CreateRequestInfo}) : Promise<ResultT<RequestModel, CreateRequestError>> {
        return (window as any).electronAPI?.addRequest({collectionPath: collectionPath,  requestInfo: requestInfo});
    }

    selectFolder(): Promise<string | null> {
        return (window as any).electronAPI?.selectFolder();
    }
}