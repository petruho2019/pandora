import { BrowserWindow } from "electron";

import { app, ipcMain } from 'electron';
import { initializeCollection } from './ipc-main-collections-initializer';
import url from "url";
import path from "path";
import { CollectionsStoreSchema } from "../shared/store/schemes/collection-store-schema";
import ElectronStore = require("electron-store");
import { initializeRequest } from "./ipc-main-requests-initializer";
import { RequestsStoreSchema } from "../shared/store/schemes/request-store-schema";


export const COLLECTIONS_KEY = 'loadedCollections';

const collectionStore = new ElectronStore<CollectionsStoreSchema>({
  name: 'collections',
  defaults: {
    loadedCollections: []
  }
});

const requestsStore = new ElectronStore<RequestsStoreSchema>({
  name: 'requests',
  defaults: {
    loadedRequests: []
  }
});

export const REQUESTS_KEY = 'loadedRequests';

const isDev = !app.isPackaged;

console.log(`IsDev: ${isDev}`);

const indexPath = isDev
  ? path.join(__dirname, '../pandora/browser/index.html')
  : path.join(app.getAppPath(), 'dist/pandora/browser/index.html');

console.log(`Index: ${indexPath} isdev: ${isDev}`);

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.loadURL(
        url.format({
          pathname: indexPath,
          protocol: 'file:',
          slashes: true
        })
      );

  win.maximize();
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });

  win.removeMenu();
}

app.on('ready', () => {

  initializeCollection(collectionStore, requestsStore, ipcMain);
  initializeRequest(requestsStore, ipcMain);
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
})

app.on('activate', () => {

  if (win === null)
    createWindow();
})