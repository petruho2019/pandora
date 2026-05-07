import { BrowserWindow } from 'electron';

import { app, ipcMain } from 'electron';
import { initializeCollection } from './ipc-main-collections-initializer';
import url from 'url';
import path from 'path';
import {
  CollectionsElectronSchema,
  CookieElectronSchema,
  RequestsElectronSchema,
} from '../shared/electron/schemes';
import ElectronStore = require('electron-store');
import { initializeRequest } from './ipc-main-requests-initializer';
import { initializeSendRequest } from './ipc-main-send-request-initializer';
import { initializeCommon } from './ipc-main-common-initializer';
import { initializeCookies } from './ipc-main-cookie-initializer';

export const COLLECTIONS_KEY = 'loadedCollections';
export const REQUESTS_KEY = 'loadedRequests';
export const COOKIES_KEY = 'loadedCookies';

const collectionStore = new ElectronStore<CollectionsElectronSchema>({
  name: 'collections',
  defaults: {
    loadedCollections: [],
  },
});

const requestsStore = new ElectronStore<RequestsElectronSchema>({
  name: 'requests',
  defaults: {
    loadedRequests: [],
  },
});

const cookiesStore = new ElectronStore<CookieElectronSchema>({
  name: 'cookies',
  defaults: {
    loadedCookies: [],
  },
});

const isDev = !app.isPackaged;

console.log(`IsDev: ${isDev}`);

const indexPath = isDev
  ? path.join(__dirname, '../pandora/browser/index.html')
  : path.join(app.getAppPath(), 'dist/pandora/browser/index.html');

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true,
    }),
  );

  win.maximize();
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });

  win.removeMenu();
};

app.on('ready', () => {
  initializeCollection(collectionStore, requestsStore, ipcMain);
  initializeRequest(requestsStore, ipcMain);
  initializeSendRequest(ipcMain);
  initializeCommon(ipcMain);
  initializeCookies(cookiesStore, ipcMain);
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
