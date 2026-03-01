import { CreateRequestInfo } from '../shared/models/event-models/add-request-info';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  addCollection: (data: { name: string; path: string; }) => ipcRenderer.invoke('add-collection', data),
  loadCollections: () => ipcRenderer.invoke('load-collections'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  removeCollection: (id: string) => ipcRenderer.invoke('remove-collection', { id }),
  addRequest: (collectionPath: string, requestInfo: CreateRequestInfo) => ipcRenderer.invoke('add-request', collectionPath, requestInfo),
  openCollection: (collectionPath: string) => ipcRenderer.invoke('open-collection', collectionPath)
});
