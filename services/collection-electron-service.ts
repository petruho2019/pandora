import { AddCollectionDto, RenameDto } from '../shared/models/dto/shared-dtos';
import { Injectable } from "@angular/core";
import { Collection } from "../shared/models/collections/collection";
import { CloneCollectionDto } from "../shared/models/collections/dto/collection-action-dtos";
import { ResultT } from '../shared/models/result';

@Injectable({ providedIn: 'root'})
export class CollectionElectronService {

    loadCollections(): Promise<Collection[]> {
        return (window as any).electronAPI?.loadCollections();
    };
    addCollection( collectionInfo : AddCollectionDto ) : Promise<ResultT<Collection, string>>{
        return (window as any).electronAPI?.addCollection({ collectionName: collectionInfo.name, collectionPath: collectionInfo.path });
    };
    openCollection({collectionPath}: {collectionPath: string}) : Promise<ResultT<Collection, string>> {
        return (window as any).electronAPI?.openCollection(collectionPath);
    };
    removeCollection(collectionId: string) : Promise<Collection[]>{
        return (window as any).electronAPI?.removeCollection(collectionId);
    };
    cloneCollection(collectionInfo: CloneCollectionDto) : Promise<ResultT<Collection, string>>{
        return (window as any).electronAPI?.cloneCollection(collectionInfo);
    };
    renameCollection(collectionInfo: RenameDto) : Promise<ResultT<Collection,string>>{
        return (window as any).electronAPI?.renameCollection(collectionInfo);
    };
    openCollectionInFS({collectionId}: {collectionId: string}) {
        (window as any).electronAPI?.openCollectionInFS(collectionId);
    };

    selectFolder(): Promise<string | null> {
        return (window as any).electronAPI?.selectFolder();
    }
}