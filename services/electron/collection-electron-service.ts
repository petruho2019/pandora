import { AddCollectionDto, RenameDto } from '../../shared/models/dto/shared-dtos';
import { Injectable } from '@angular/core';
import { Collection } from '../../shared/models/collections/collection';
import { CloneCollectionDto } from '../../shared/models/collections/dto/collection-action-dtos';
import { ResultT } from '../../shared/models/result';
import { TableRow } from '../../shared/models/requests/request';
import { AuthItem } from '../../shared/models/requests/http/http-request-model';

@Injectable({ providedIn: 'root' })
export class CollectionElectronService {
  loadCollections(): Promise<Collection[]> {
    return (window as any).electronAPI?.loadCollections();
  }
  addCollection(collectionInfo: AddCollectionDto): Promise<ResultT<Collection, string>> {
    return (window as any).electronAPI?.addCollection({
      collectionName: collectionInfo.name,
      collectionPath: collectionInfo.path,
    });
  }
  openCollection({
    collectionPath,
  }: {
    collectionPath: string;
  }): Promise<ResultT<Collection, string>> {
    return (window as any).electronAPI?.openCollection(collectionPath);
  }
  removeCollection(collectionId: string): Promise<Collection[]> {
    return (window as any).electronAPI?.removeCollection(collectionId);
  }
  cloneCollection(collectionInfo: CloneCollectionDto): Promise<ResultT<Collection, string>> {
    return (window as any).electronAPI?.cloneCollection(collectionInfo);
  }
  renameCollection(collectionInfo: RenameDto): Promise<ResultT<Collection, string>> {
    return (window as any).electronAPI?.renameCollection(collectionInfo);
  }
  openCollectionInFS({ collectionId }: { collectionId: string }) {
    (window as any).electronAPI?.openCollectionInFS(collectionId);
  }
  deleteCollection(collId: string): Promise<ResultT<Collection[], string>> {
    return (window as any).electronAPI.deleteCollection(collId);
  }
  updateCollectionHeaders(
    collId: string,
    headers: TableRow[],
  ): Promise<ResultT<Collection, string>> {
    return (window as any).electronAPI.updateCollectionHeaders(collId, headers);
  }
  updateCollectionAuth(collId: string, auth: AuthItem): Promise<ResultT<Collection, string>> {
    return (window as any).electronAPI.updateCollectionAuth(collId, auth);
  }

  selectFolder(): Promise<string | null> {
    return (window as any).electronAPI?.selectFolder();
  }
}
