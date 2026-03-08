import { CreateRequestInfo } from '../shared/models/event-models/add-request-info';
import { CloneCollectionDto, RenameCollectionDto } from '../shared/models/collections/dto/collection-action-dtos';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  addCollection: (data: { name: string; path: string; }) => ipcRenderer.invoke('add-collection', data),
  loadCollections: () => ipcRenderer.invoke('load-collections'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  removeCollection: (collectionId: string) => ipcRenderer.invoke('remove-collection', collectionId),
  cloneCollection: (collectionInfo: CloneCollectionDto) => ipcRenderer.invoke('clone-collection', collectionInfo),
  renameCollection: (collectionInfo: RenameCollectionDto) => ipcRenderer.invoke('rename-collection', collectionInfo),
  addRequest: (collectionPath: string, requestInfo: CreateRequestInfo) => ipcRenderer.invoke('add-request', collectionPath, requestInfo),
  openCollection: (collectionPath: string) => ipcRenderer.invoke('open-collection', collectionPath)
});
