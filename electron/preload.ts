import { RenameDto } from './../shared/models/dto/shared-dtos';
import { CreateRequestInfo } from '../shared/models/event-models/add-request-info';
import { CloneCollectionDto } from '../shared/models/collections/dto/collection-action-dtos';
import { contextBridge, ipcRenderer } from 'electron';
import { LoadRequestDto, RenameRequestDto } from '../shared/models/requests/dto/request-dtos';

contextBridge.exposeInMainWorld('electronAPI', {
  addCollection: (data: { name: string; path: string; }) => ipcRenderer.invoke('add-collection', data),
  loadCollections: () => ipcRenderer.invoke('load-collections'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  removeCollection: (collectionId: string) => ipcRenderer.invoke('remove-collection', collectionId),
  cloneCollection: (collectionInfo: CloneCollectionDto) => ipcRenderer.invoke('clone-collection', collectionInfo),
  renameCollection: (collectionInfo: RenameDto) => ipcRenderer.invoke('rename-collection', collectionInfo),
  openCollection: (collectionPath: string) => ipcRenderer.invoke('open-collection', collectionPath),
  openCollectionInFS: (collectionId: string) => ipcRenderer.invoke('open-collection-in-fs', collectionId),

  addRequest: (collectionPath: string, requestInfo: CreateRequestInfo) => ipcRenderer.invoke('add-request', collectionPath, requestInfo),
  renameRequest: (requestInfo: RenameRequestDto) => ipcRenderer.invoke('rename-request', requestInfo),
  loadRequests: (collectionInfo: LoadRequestDto) => ipcRenderer.invoke('load-requests', collectionInfo),
});
