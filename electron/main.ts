import { BrowserWindow } from "electron";

import { app, ipcMain } from 'electron';
import { initializeCollection } from './ipc-main-collections-initializer';
import url from "url";
import path from "path";
import { CollectionsStoreSchema } from "../shared/store/schemes/collection-store-schema";
import ElectronStore = require("electron-store");
import { initializeRequest } from "./ipc-main-requests-initializer";

const store = new ElectronStore<CollectionsStoreSchema>({
  name: 'collections',
  defaults: {
    loadedCollections: []
  }
});

const indexPath = path.join(
  path.resolve(app.getAppPath(), '..'),
  'silver',
  'browser',
  'index.html'
);

let win: BrowserWindow | null;

initializeCollection(store, ipcMain);
initializeRequest(store, ipcMain);

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

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
})

app.on('activate', () => {

  if (win === null)
    createWindow();
})