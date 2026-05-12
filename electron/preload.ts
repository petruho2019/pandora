import { RenameDto } from './../shared/models/dto/shared-dtos';
import { CreateRequestInfo } from '../shared/models/event-models/add-request-info';
import { CloneCollectionDto } from '../shared/models/collections/dto/collection-action-dtos';
import { contextBridge, ipcRenderer } from 'electron';
import {
  CloneRequestDto,
  DeleteRequestDto,
  LoadRequestDto,
  OpenRequestInFSDto,
  RenameRequestDto,
  UpdateRequestInfoDto,
} from '../shared/models/requests/dto/request-dtos';
import {
  AuthItem,
  CookieModel,
  HttpConfigPayload,
} from '../shared/models/requests/http/http-request-model';
import { TableRow } from '../shared/models/requests/request';

contextBridge.exposeInMainWorld('electronAPI', {
  addCollection: (data: { name: string; path: string }) =>
    ipcRenderer.invoke('add-collection', data),
  loadCollections: () => ipcRenderer.invoke('load-collections'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  removeCollection: (collectionId: string) => ipcRenderer.invoke('remove-collection', collectionId),
  cloneCollection: (collectionInfo: CloneCollectionDto) =>
    ipcRenderer.invoke('clone-collection', collectionInfo),
  renameCollection: (collectionInfo: RenameDto) =>
    ipcRenderer.invoke('rename-collection', collectionInfo),
  openCollection: (collectionPath: string) => ipcRenderer.invoke('open-collection', collectionPath),
  openCollectionInFS: (collectionId: string) =>
    ipcRenderer.invoke('open-collection-in-fs', collectionId),
  deleteCollection: (collectionId: string) => ipcRenderer.invoke('delete-collection', collectionId),

  addRequest: (collectionPath: string, requestInfo: CreateRequestInfo) =>
    ipcRenderer.invoke('add-request', collectionPath, requestInfo),
  renameRequest: (requestInfo: RenameRequestDto) =>
    ipcRenderer.invoke('rename-request', requestInfo),
  loadRequests: (requestInfo: LoadRequestDto) => ipcRenderer.invoke('load-requests', requestInfo),
  cloneRequest: (requestInfo: CloneRequestDto) => ipcRenderer.invoke('clone-request', requestInfo),
  openRequestInFS: (requestInfo: OpenRequestInFSDto) =>
    ipcRenderer.invoke('open-request-in-fs', requestInfo),
  deleteRequest: (requestInfo: DeleteRequestDto) =>
    ipcRenderer.invoke('delete-request', requestInfo),
  updateRequest: (reqInfo: UpdateRequestInfoDto) => ipcRenderer.invoke('update-request', reqInfo),
  sendRequest: (config: HttpConfigPayload) => ipcRenderer.invoke('send-request', config),
  cancelRequest: (id: string) => ipcRenderer.invoke('cancel-request', id),
  updateCollectionHeaders: (collId: string, headers: TableRow[]) =>
    ipcRenderer.invoke('update-headers', collId, headers),
  updateCollectionAuth: (collId: string, auth: AuthItem) =>
    ipcRenderer.invoke('update-auth', collId, auth),

  openFile: () => ipcRenderer.invoke('open-file'),
  fileExists: (path: string) => ipcRenderer.invoke('file-exists', path),
  getFileStream: (path: string) => ipcRenderer.invoke('get-file-stream', path),

  addCookie: (cookieInfo: { fromServer: boolean; cookie: CookieModel }) =>
    ipcRenderer.invoke('add-cookie', cookieInfo),
  modifyCookie: (cookie: CookieModel) => ipcRenderer.invoke('modify-cookie', cookie),
  deleteCookie: (cookie: CookieModel) => ipcRenderer.invoke('delete-cookie', cookie),
  deleteDomain: (domainName: string) => ipcRenderer.invoke('delete-domain', domainName),
  loadCookies: () => ipcRenderer.invoke('load-cookies'),
});
