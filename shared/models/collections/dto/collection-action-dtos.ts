import { AuthItem } from '../../requests/http/http-request-model';
import { TableRow } from '../../requests/request';

export interface CloneCollectionDto {
  collectionName: string;
  folderName: string;
  collectionPath: string;
  sourceCollectionId: string;
}

export interface CloseCollectionInfo {
  collectionName: string;
  collectionId: string;
  collectionPath: string;
}

export interface DeleteCollectionDto {
  collectionName: string;
  collectionId: string;
  collectionPath: string;
}

export interface UpdateCollectionHeaders {
  collId: string;
  headers: TableRow[];
}

export interface UpdateCollectionAuth {
  collId: string;
  auth: AuthItem;
}
