import { RenameDto } from './../shared/models/dto/shared-dtos';
import { dialog, BrowserWindow, IpcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { Collection } from '../shared/models/collections/collection';
import {
  COLLECTION_CONFIG_FILE_NAME,
  COLLECTION_CONFIG_FILE_FORMAT_ERROR,
} from '../shared/models/constants';
import {
  buildFailureResult,
  buildFailureResultT,
  buildSuccessResult,
  buildSuccessResultT,
  Result,
  ResultT,
} from '../shared/models/result';
import { CollectionYmlConfig } from '../shared/models/collections/collection-config';
import ElectronStore = require('electron-store');
import yaml from 'js-yaml';
import { CloneCollectionDto } from '../shared/models/collections/dto/collection-action-dtos';
import { spawn } from 'child_process';
import { platform } from 'os';
import { RequestModel, TableRow } from '../shared/models/requests/request';
import { ZodError } from 'zod';
import { COLLECTIONS_KEY, REQUESTS_KEY } from './main';
import {
  AuthItem,
  buildDefaultAuth,
  HttpRequestSchema,
} from '../shared/models/requests/http/http-request-model';
import { CollectionsElectronSchema, RequestsElectronSchema } from '../shared/electron/schemes';
import { AUTH_KIND } from '../shared/models/requests/http/auth';

export function initializeCollection(
  collectionStore: ElectronStore<CollectionsElectronSchema>,
  requestStore: ElectronStore<RequestsElectronSchema>,
  ipcMain: IpcMain,
) {
  //#region load-collections
  ipcMain.handle('load-collections', async (): Promise<Collection[]> => {
    const collectionsFromStore = collectionStore.get(COLLECTIONS_KEY, []);

    const [validCollections, isCollectionPathsValid] =
      await validateCollectionPaths(collectionsFromStore);

    if (!isCollectionPathsValid) {
      console.log(`Store updated: ${validCollections.length} collections`);
      collectionStore.set(COLLECTIONS_KEY, validCollections);

      return validCollections;
    } else {
      console.log(`Store NOT updated: ${validCollections.length} collections`);

      return collectionsFromStore;
    }
  });

  //#region add-collection

  ipcMain.handle(
    'add-collection',
    async (
      event,
      { collectionName, collectionPath }: { collectionName: string; collectionPath: string },
    ): Promise<ResultT<Collection, string>> => {
      if (!collectionName) {
        return buildFailureResultT('Требуются название коллекции');
      }
      if (!collectionPath) {
        return buildFailureResultT('Требуются путь к коллекции');
      }

      if (!path.isAbsolute(collectionPath)) {
        return buildFailureResultT('Путь должен быть абсолютным');
      }

      const fullCollectionPath = path.join(collectionPath, collectionName.trim());

      fs.stat(fullCollectionPath, (err, stat) => {
        if (err) {
          if (err.code === 'ENOENT') return;
          return buildFailureResultT('Ошибка при добавлении коллекции');
        }
        if (stat.isDirectory()) return buildFailureResultT('Коллекции уже существует');
      });

      const collections = collectionStore.get(COLLECTIONS_KEY, []);

      const existsInStore = collections.some((item) => item.path === fullCollectionPath);

      if (existsInStore) {
        return buildFailureResultT('Коллекция уже добавлена');
      }

      try {
        await fs.promises.mkdir(fullCollectionPath, { recursive: true });
      } catch (err) {
        console.error('Error while creating collection folder', err);
        return buildFailureResultT('Не удалось создать папку коллекции');
      }

      var createCollectionConfigFileResult = await createCollectionConfigFile(
        fullCollectionPath,
        collectionName,
      );

      if (createCollectionConfigFileResult.isSuccess) {
        const newCollection = mapCollection(
          fullCollectionPath,
          createCollectionConfigFileResult.body!,
        );

        collections.push(newCollection);
        collectionStore.set(COLLECTIONS_KEY, collections);

        return buildSuccessResultT(newCollection);
      }

      return buildFailureResultT(createCollectionConfigFileResult.error!);
    },
  );

  //#region remove-collection

  ipcMain.handle('remove-collection', (event, collectionId: string): Collection[] => {
    const collections = collectionStore.get(COLLECTIONS_KEY, []);
    const filtered = collections.filter((item) => item.id !== collectionId);
    collectionStore.set(COLLECTIONS_KEY, filtered);

    return filtered;
  });

  //#region select-folder

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
      properties: ['openDirectory'],
      title: 'Выберите папку с коллекцией',
    });
    return result.canceled ? null : result.filePaths[0];
  });

  //#region open-collection

  ipcMain.handle(
    'open-collection',
    async (event, collectionPath): Promise<ResultT<Collection, string>> => {
      if (!collectionPath) {
        return buildFailureResultT('Требуются путь к коллекции');
      }
      if (!path.isAbsolute(collectionPath)) {
        return buildFailureResultT('Путь должен быть абсолютным');
      }
      if (!fs.existsSync(collectionPath)) {
        return buildFailureResultT('Некорректный путь');
      }

      let collectionConfigResult = await getCollectionConfigFile(collectionPath);

      if (collectionConfigResult.isFailure)
        return buildFailureResultT(collectionConfigResult.error!);

      const isValidCollectionConfigResult = validationCollectionYmlConfig(
        collectionConfigResult.body!,
      );
      if (isValidCollectionConfigResult.isFailure)
        return buildFailureResultT(isValidCollectionConfigResult.errorMessage!);

      const collections = collectionStore.get(COLLECTIONS_KEY, []);
      const existsInStore = collections.some((item) => item.path === collectionPath);

      if (existsInStore) {
        return buildFailureResultT('Коллекция уже добавлена');
      }

      var openedCollection = mapCollection(collectionPath, collectionConfigResult.body!);

      collections.push(openedCollection);
      collectionStore.set(COLLECTIONS_KEY, collections);

      const getRequestsResult = await getRequestsByPath(openedCollection.path);

      if (getRequestsResult.isFailure) return buildFailureResultT(getRequestsResult.error!);

      const requestsFromStore = requestStore.get(REQUESTS_KEY, []);
      requestsFromStore.push(...getRequestsResult.body!);
      requestStore.set(REQUESTS_KEY, requestsFromStore);

      return buildSuccessResultT(openedCollection);
    },
  );

  //region clone-collection

  ipcMain.handle(
    'clone-collection',
    async (event, collectionInfo: CloneCollectionDto): Promise<ResultT<Collection, string>> => {
      const validationResult = validateCloneCollectionDto(collectionInfo);
      if (validationResult.isFailure) return buildFailureResultT(validationResult.errorMessage!);

      const collectionsFromStore = collectionStore.get(COLLECTIONS_KEY, []);
      const collectionFromStore = collectionsFromStore.find(
        (c) => c.id === collectionInfo.sourceCollectionId,
      );

      if (!collectionFromStore) return buildFailureResultT(`Коллекция не найдена`);

      const newCollectionPath = path.join(collectionInfo.collectionPath, collectionInfo.folderName);

      //if(collectionFromStore.path === newCollectionPath) return buildFailureResultT("В данной папке уже есть коллекция");

      try {
        await fs.promises.mkdir(newCollectionPath);
      } catch (err: any) {
        console.log(`${err}`);

        if (err.code === 'ERR_FS_CP_EINVAL') {
          return buildFailureResultT('Невозможно клонировать коллекцию в её же папку или подпапку');
        }
        if (err.code === 'EEXIST') {
          return buildFailureResultT(
            `Коллекция с таким именем уже существует по пути\n ${collectionInfo.collectionPath}`,
          );
        }

        console.log(`${err.code}`);
        return buildFailureResultT('Ошибка при клонировании коллекции');
      }

      var createCollectionConfigFileResult = await createCollectionConfigFile(
        newCollectionPath,
        collectionInfo.collectionName,
      );

      if (createCollectionConfigFileResult.isFailure) {
        await deleteFolder(newCollectionPath);
        return buildFailureResultT(`Builder collection ${createCollectionConfigFileResult.error}`);
      }

      const newCollection = mapCollection(
        newCollectionPath,
        createCollectionConfigFileResult.body!,
      );

      const copiedRequestsResult = await copyRequests(
        collectionFromStore.path,
        newCollection.path,
        newCollection.id,
      );

      if (copiedRequestsResult.isFailure) {
        await deleteFolder(newCollectionPath);
        return buildFailureResultT(copiedRequestsResult.error!);
      }

      const requestsFromStore = requestStore.get(REQUESTS_KEY, []);
      requestsFromStore.push(...copiedRequestsResult.body!);

      collectionsFromStore.push(newCollection);
      collectionStore.set(COLLECTIONS_KEY, collectionsFromStore);

      return buildSuccessResultT(newCollection);
    },
  );

  //region rename-collection

  ipcMain.handle(
    'rename-collection',
    (event, collectionInfo: RenameDto): ResultT<Collection, string> => {
      if (!collectionInfo.name) {
        return buildFailureResultT(`Название коллeкции обязательно`);
      }

      const collectionsFromStore = collectionStore.get(COLLECTIONS_KEY, []);
      const collectionFromStore = collectionsFromStore.find((c) => c.id === collectionInfo.id);

      if (!collectionFromStore) return buildFailureResultT(`Коллекция не найдена`);

      collectionFromStore.name = collectionInfo.name;

      collectionsFromStore.splice(
        collectionsFromStore.findIndex((c) => c.id === collectionInfo.id),
        1,
        collectionFromStore,
      );

      // collectionsFromStore.push(newCollection);
      // store.set(COLLECTIONS_KEY, collectionsFromStore);

      return buildSuccessResultT(collectionFromStore);
    },
  );

  //region open-collection-in-fs
  ipcMain.handle('open-collection-in-fs', async (event, collectionId: string) => {
    const coll = collectionStore.get(COLLECTIONS_KEY, []).find((c) => c.id === collectionId);

    if (!coll) return buildFailureResultT('Коллекция не найдена');
    if (!coll.path) return buildFailureResultT('Путь коллекции не найден');

    const platformName = platform().toLowerCase().replace(/[0-9]/g, '').replace('darwin', 'macos');

    switch (platformName) {
      case 'win':
        spawn('explorer.exe', [coll.path], {
          stdio: 'ignore',
          detached: true,
        });
        break;
      case 'linux':
        spawn('xdg-open', [coll.path]);
        break;
      case 'macos':
        spawn('open', [coll.path]);
        break;
      default:
        throw new Error('Неподдерживаемая ОС');
    }

    return true;
  });

  //region delete-collection

  ipcMain.handle(
    'delete-collection',
    async (event, collectionId: string): Promise<ResultT<Collection[], string>> => {
      if (!collectionId) return buildFailureResultT('Непредвиденная ошибка при удалении коллекции');

      const collectionsFromStore = collectionStore.get(COLLECTIONS_KEY, []);
      const collectionFromStore = collectionsFromStore.find((c) => c.id === collectionId);

      if (!collectionFromStore) return buildFailureResultT(`Коллекция не найдена`);

      let collectionConfigResult = await getCollectionConfigFile(collectionFromStore.path);

      if (collectionConfigResult.isFailure)
        return buildFailureResultT(collectionConfigResult.error!);

      try {
        await fs.promises.rm(collectionFromStore.path, { recursive: true });
      } catch (error: any) {
        console.log(`Error code: ${error.code}`);
        console.log(`Error: ${error}`);
        return buildFailureResultT('Ошибка при удалении коллекции');
      }

      const newCollections = collectionsFromStore.filter((c) => c.id !== collectionId);

      collectionStore.set(COLLECTIONS_KEY, newCollections);

      return buildSuccessResultT(newCollections);
    },
  );

  //#region update-headers

  ipcMain.handle(
    'update-headers',
    async (event, collId: string, headers: TableRow[]): Promise<ResultT<Collection, string>> => {
      if (!collId)
        return buildFailureResultT('Непредвиденная ошибка при сохранении заголовков коллекции');

      const collectionsFromStore = collectionStore.get(COLLECTIONS_KEY, []);
      const collectionFromStore = collectionsFromStore.find((c) => c.id === collId);

      if (!collectionFromStore) return buildFailureResultT(`Коллекция не найдена`);

      let collectionConfigResult = await getCollectionConfigFile(collectionFromStore.path);

      if (collectionConfigResult.isFailure)
        return buildFailureResultT(collectionConfigResult.error!);

      let config = collectionConfigResult.body;

      config!.collectionSettings.headers = headers;

      try {
        fs.promises.writeFile(
          path.join(collectionFromStore.path, COLLECTION_CONFIG_FILE_NAME),
          yaml.dump(config),
          { encoding: 'utf-8' },
        );
      } catch (error: any) {
        console.log(`Error code: ${error.code}`);
        console.log(`Error: ${error}`);
        return buildFailureResultT('Ошибка при сохранении заголовков');
      }

      const updatedColl: Collection = {
        ...collectionFromStore,
        collectionConfig: {
          ...collectionFromStore.collectionConfig,
          collectionSettings: {
            ...collectionFromStore.collectionConfig.collectionSettings,
            headers: headers,
          },
        },
      };

      collectionsFromStore.splice(
        collectionsFromStore.indexOf(collectionFromStore),
        1,
        updatedColl,
      );

      collectionStore.set(COLLECTIONS_KEY, collectionsFromStore);

      return buildSuccessResultT(updatedColl);
    },
  );

  //#region update-auth

  ipcMain.handle(
    'update-auth',
    async (event, collId: string, auth: AuthItem): Promise<ResultT<Collection, string>> => {
      if (!collId)
        return buildFailureResultT('Непредвиденная ошибка при сохранении аутентификации коллекции');

      const collectionsFromStore = collectionStore.get(COLLECTIONS_KEY, []);
      const collectionFromStore = collectionsFromStore.find((c) => c.id === collId);

      if (!collectionFromStore) return buildFailureResultT(`Коллекция не найдена`);

      let collectionConfigResult = await getCollectionConfigFile(collectionFromStore.path);

      if (collectionConfigResult.isFailure)
        return buildFailureResultT(collectionConfigResult.error!);

      let config = collectionConfigResult.body;

      config!.collectionSettings.auth[auth.kind] = auth;

      try {
        fs.promises.writeFile(
          path.join(collectionFromStore.path, COLLECTION_CONFIG_FILE_NAME),
          yaml.dump(config),
          { encoding: 'utf-8' },
        );
      } catch (error: any) {
        console.log(`Error code: ${error.code}`);
        console.log(`Error: ${error}`);
        return buildFailureResultT('Ошибка при сохранении аутентификации');
      }

      const updatedColl: Collection = {
        ...collectionFromStore,
        collectionConfig: {
          ...collectionFromStore.collectionConfig,
          collectionSettings: {
            ...collectionFromStore.collectionConfig.collectionSettings,
            auth: {
              ...collectionFromStore.collectionConfig.collectionSettings.auth,
              [auth.kind]: auth,
            },
          },
        },
      };

      collectionsFromStore.splice(
        collectionsFromStore.indexOf(collectionFromStore),
        1,
        updatedColl,
      );

      collectionStore.set(COLLECTIONS_KEY, collectionsFromStore);

      return buildSuccessResultT(updatedColl);
    },
  );
}

//region functions

async function getCollectionConfigFile(
  collPath: string,
): Promise<ResultT<CollectionYmlConfig, string>> {
  try {
    const collectionConfig = yaml.load(
      await fs.promises.readFile(path.join(collPath, COLLECTION_CONFIG_FILE_NAME), 'utf-8'),
    ) as CollectionYmlConfig;
    return buildSuccessResultT(collectionConfig);
  } catch {
    return buildFailureResultT(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
  }
}

async function getRequestsByPath(collectionPath: string): Promise<ResultT<RequestModel[], string>> {
  let requestFiles: fs.Dirent[];
  let requests: RequestModel[] = [];
  try {
    requestFiles = await fs.promises.readdir(collectionPath, { withFileTypes: true });
  } catch (error) {
    console.log(`Ошибка  ${error}`);
    return buildFailureResultT(`Ошибка при клонировании коллекции`);
  }

  for (const requestFileInfo of requestFiles) {
    if (!requestFileInfo.isFile()) {
      console.log(`Found ${requestFileInfo.name} not file, will skip`);
      continue;
    }
    if (requestFileInfo.name === COLLECTION_CONFIG_FILE_NAME) {
      console.log(`Found collection config file, will skip`);
      continue;
    }

    try {
      const requestFullPath = path.join(collectionPath, requestFileInfo.name);
      const raw = JSON.parse(
        await fs.promises.readFile(requestFullPath, { encoding: 'utf8' }),
      ) as RequestModel;

      const requestModel = HttpRequestSchema.parse(raw) as RequestModel;

      requests.push(requestModel);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(`Incorrect file content ${requestFileInfo.name}, ${error}`);
      }
      if (error instanceof SyntaxError) {
        console.error(`Error when processing file ${requestFileInfo.name}, ${error}`);
      }

      console.error(`Error when copying request ${requestFileInfo.name}, ${error}`);
    }
  }

  return buildSuccessResultT(requests);
}

async function deleteFolder(path: string) {
  await fs.promises.rm(path, { recursive: true, force: true });
}

async function copyRequests(
  oldCollectionPath: string,
  newCollectionPath: string,
  newCollectionId: string,
): Promise<ResultT<RequestModel[], string>> {
  let requestFiles: fs.Dirent[];

  try {
    requestFiles = await fs.promises.readdir(oldCollectionPath, { withFileTypes: true });
  } catch (error) {
    console.log(`Ошибка  ${error}`);
    return buildFailureResultT(`Ошибка при клонировании коллекции`);
  }

  let copiedRequests: RequestModel[] = [];

  for (const requestFileInfo of requestFiles) {
    console.log(`Found ${requestFileInfo.name}`);

    if (!requestFileInfo.isFile()) {
      console.log(`Found not file, will skip`);
      continue;
    }
    if (requestFileInfo.name === COLLECTION_CONFIG_FILE_NAME) {
      console.log(`Found collection config file, will skip`);
      continue;
    }

    try {
      const requestFullPath = path.join(oldCollectionPath, requestFileInfo.name);
      const raw = JSON.parse(
        await fs.promises.readFile(requestFullPath, { encoding: 'utf8' }),
      ) as RequestModel;

      const requestModel = HttpRequestSchema.parse(raw) as RequestModel;

      requestModel.collectionId = newCollectionId;
      requestModel.id = uuidv4();

      await fs.promises.writeFile(
        path.join(newCollectionPath, requestFileInfo.name),
        JSON.stringify(requestModel, null, 2),
      );

      copiedRequests.push(requestModel);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(`Incorrect file content ${requestFileInfo.name}, ${error}`);
      }
      if (error instanceof SyntaxError) {
        console.error(`Error when processing file ${requestFileInfo.name}, ${error}`);
      }

      console.error(`Error when copying request ${requestFileInfo.name}, ${error}`);
    }
  }

  return buildSuccessResultT(copiedRequests);
}

function validateCloneCollectionDto(collectionInfo: CloneCollectionDto): Result {
  if (!collectionInfo.collectionName) {
    return buildFailureResult(`Название коллeкции обязательно`);
  }

  if (!collectionInfo.folderName) {
    return buildFailureResult(`Название папки обязательно`);
  }

  if (!collectionInfo.collectionPath) {
    return buildFailureResult(`Путь коллекции обязательно`);
  }

  if (!path.isAbsolute(collectionInfo.collectionPath)) {
    return buildFailureResult(`Путь должен быть абсолютным`);
  }

  return buildSuccessResult();
}

async function createCollectionConfigFile(
  collectionPath: string,
  collectionName: string,
): Promise<ResultT<CollectionYmlConfig, string>> {
  // todo Вынести writeFile в другой метод

  const collectionConfigFile: CollectionYmlConfig =
    createCollectionConfigByCollection(collectionName);

  try {
    await fs.promises.writeFile(
      path.join(collectionPath, COLLECTION_CONFIG_FILE_NAME),
      yaml.dump(collectionConfigFile),
    );

    return buildSuccessResultT(collectionConfigFile);
  } catch (err) {
    console.error('Не удалось создать файл конфигурации', err);
    return buildFailureResultT('Error while creating configuration file');
  }
}

function createCollectionConfigByCollection(collectionName: string): CollectionYmlConfig {
  return {
    collectionInfo: {
      id: uuidv4(),
      name: collectionName,
    },
    collectionSettings: {
      headers: [],
      auth: buildDefaultAuth(),
    },
  };
}

function validationCollectionYmlConfig(config: CollectionYmlConfig): Result {
  const info = config.collectionInfo;

  if (!isValidUUID(info.id)) {
    console.log(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
    return buildFailureResult(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
  }

  if (!info.name || info.name.trim().length === 0) {
    console.log(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
    return buildFailureResult(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
  }
  return buildSuccessResult();
}

async function validateCollectionPaths(
  collectionsFromStore: Collection[],
): Promise<[Collection[], boolean]> {
  const validCollections: Collection[] = [];
  let isCollectionPathsValid = true;

  for (const col of collectionsFromStore) {
    try {
      const stat = await fs.promises.stat(col.path);

      if (!stat.isDirectory()) {
        console.error(`Ошибка при загрузке коллекции ${col.path}`);
        isCollectionPathsValid = false;
        continue;
      }

      validCollections.push(col);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        console.error(`Коллекция ${col.path} не найдена`);
      } else {
        console.error(`Ошибка при проверке коллекции ${col.path}: ${err.message}`);
      }
      isCollectionPathsValid = false;
    }
  }

  return [validCollections, isCollectionPathsValid];
}

function mapCollection(
  collectionPath: string,
  collectionConfigYml: CollectionYmlConfig,
): Collection {
  return {
    id: collectionConfigYml.collectionInfo.id,
    name: collectionConfigYml.collectionInfo.name,
    path: collectionPath,
    collectionConfig: collectionConfigYml,
  };
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
