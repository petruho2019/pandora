import { buildSuccessResult, Result } from './../shared/models/result';
import { RequestsStoreSchema } from './../shared/store/schemes/request-store-schema';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { RequestModel, RequestType, RequestTypes } from '../shared/models/requests/request'
import { buildFailureResult, buildFailureResultT, buildSuccessResultT, ResultT } from '../shared/models/result'
import ElectronStore = require('electron-store');
import { CreateRequestInfo } from '../shared/models/event-models/add-request-info';
import { CloneRequestDto, DeleteRequestDto, LoadRequestDto, OpenRequestInFSDto, RenameRequestDto } from '../shared/models/requests/dto/request-dtos';
import { COLLECTION_CONFIG_FILE_NAME } from '../shared/models/constants';
import { ZodError } from 'zod';
import { platform } from 'os';
import { spawn } from 'child_process';
import { IpcMain } from 'electron';
import { REQUESTS_KEY } from './main';
import { HttpMethod, HttpRequestModel, HttpRequestSchema } from '../shared/models/requests/http/http-request-model';



export function initializeRequest(store: ElectronStore<RequestsStoreSchema>, ipcMain: IpcMain) {

  //region add-request
  ipcMain.handle('add-request', async (event, { requestInfo }: {requestInfo: CreateRequestInfo}) : Promise<ResultT<HttpRequestModel, string>> => {
    try {

      console.log(`Check collectionPath`);

      if (!requestInfo.collectionPath || typeof requestInfo.collectionPath !== 'string') {
        return createRequestError(`Путь к коллекции должен быть заполнен`);
      }

      let collectionStat: fs.Stats;
      try {
        collectionStat = await fs.promises.stat(requestInfo.collectionPath);
      } catch (err) {
        console.log(`Error ${err}`);

        if(err.code === 'ENOENT')
          return buildFailureResultT(`Попытка добавить запрос в удаленную коллекцию`)

        return buildFailureResultT(`Ошибка при создании запроса`)
      }

      if(!collectionStat.isDirectory())
        return buildFailureResultT(`Ошибка при создании запроса`)

      console.log(`Check request name`);
      const rawName = requestInfo.name.trim();
      if (!rawName) {
        return createRequestError(`Название запроса должно быть заполнено`);
      }

      console.log(`Check request name with regex`);
      const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/;
      if (invalidCharsRegex.test(rawName)) {
      return createRequestError(`Название файла содержит недопустимые символы`);
      }

      const safeName = rawName.trim();
      if (!safeName) {
      return createRequestError(`Название файла некорректно`);
      }
    
      console.log(`Check request type`);
      const requestTypes = Object.values(RequestTypes);
      const type = String(requestInfo.type ?? '').trim();

      console.log(`Request type is ${type}`);
      console.log(`Request types ${requestTypes}`);

      if (!requestTypes.includes(type as RequestType)) {
        return createRequestError(`Некорректный тип запроса`);
      }

      console.log(`Prepare file path`);

      const resolvedPath = path.resolve(requestInfo.collectionPath);
      const finalFileName = `${safeName}.json`;
      const finalPath = path.join(resolvedPath, finalFileName);

      console.log(`Check file does not exist`);

      const dirFiles = await fs.promises.readdir(resolvedPath);
      const hasDuplicate = dirFiles.some(f => {
        if (path.extname(f).toLowerCase() !== '.json') return false;
        const base = path.basename(f, '.json');
        return base.toLowerCase() === safeName.toLowerCase();
      });
      if (hasDuplicate) {
        return createRequestError("Запрос с таким именем уже есть");
      }

      const savedRequest: RequestModel = mapCreateRequestModel(requestInfo, uuidv4());

      const payload = JSON.stringify(savedRequest, null, 2);

      console.log(`Payload: ${payload}`);
      console.log(`FinalPath: ${finalPath}`);

      await fs.promises.writeFile(finalPath, payload, { encoding: 'utf8' });

      const requestsFromStore = store.get(REQUESTS_KEY, []);
      requestsFromStore.push(savedRequest)
      store.set(REQUESTS_KEY, requestsFromStore)

      return buildSuccessResultT(savedRequest);
    } catch (err: any) {
      console.error(`Log from ipcMain ERROR ${err}`);
      return buildFailureResultT(err?.message ?? String(err));
    }
  });

  //region load-requests

  ipcMain.handle('load-requests', async (event, collectionInfo: LoadRequestDto) : Promise<ResultT<RequestModel[], string>> => {

    console.log(`Load requests ${JSON.stringify(collectionInfo)}`);
    console.log(`${collectionInfo.collectionPath}`);

    if (!path.isAbsolute(collectionInfo.collectionPath)) 
      return buildFailureResultT(`Путь до коллекции должен быть абсолютным`);
    if (!collectionInfo.collectionId)
      return buildFailureResultT(`Collection id is null!`);

    let requestsFromCollectionPath: RequestModel[] = [];
    let requestsFileInfo: fs.Dirent[];

    try {
      requestsFileInfo = await fs.promises.readdir(collectionInfo.collectionPath, {withFileTypes: true});
    } catch (error) {
      return buildFailureResultT(`Ошибка при загрузке файлов`);
    }

    for (const fileInfo of requestsFileInfo) {
      if(fileInfo.name !== COLLECTION_CONFIG_FILE_NAME && fileInfo.isFile()){
        try {
          const raw = JSON.parse(await fs.promises.readFile(path.join(collectionInfo.collectionPath, fileInfo.name), { encoding: 'utf8'})) as RequestModel;

          requestsFromCollectionPath.push(HttpRequestSchema.parse(raw) as RequestModel);
          console.log(`File with name: ${fileInfo.name} successfully loaded`);

        } catch (error) {
          
          if(error instanceof ZodError){
            return buildFailureResultT(`Ошибка при загрузке файла ${fileInfo.name} , ${error.message}`);
          }
          if (error instanceof SyntaxError) {
            return buildFailureResultT(`Невалидный JSON в файле ${fileInfo.name} , ${error.message}`);
          }

          return buildFailureResultT(`Неизвестная ошибка в файле ${fileInfo.name} , ${error}`);
        }
      }
    }

    store.set(REQUESTS_KEY, requestsFromCollectionPath);

    return buildSuccessResultT(requestsFromCollectionPath);
  });

  // region renane-request
  ipcMain.handle('rename-request', async (event, requestInfo: RenameRequestDto) : Promise<ResultT<RequestModel, string>> => {
    validateRenameRequestDto(requestInfo);

    console.log(`Rename request ${JSON.stringify(requestInfo)}`);

    const requestFromStore = store.get(REQUESTS_KEY, []);
    const requestById = requestFromStore.find(r => r.id === requestInfo.requestId);

    if(!requestById) return buildFailureResultT(`Запрос ${requestById!.name} не найден`);

    requestById.name = requestInfo.newName;
    requestById.fileName = requestInfo.newFileName;

    console.log(`new request: ${JSON.stringify(requestById)}`);

    try {
      await fs.promises.rename(path.join(requestInfo.collectionPath, requestInfo.oldFileName + '.json'), path.join(requestInfo.collectionPath, requestInfo.newFileName+ '.json'));
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.error(`Запрос ${requestById.name} не найден , ${err}`);
      }
    }

    const requestJSON = JSON.stringify(requestById, null, 2);
    await fs.promises.writeFile(path.join(requestInfo.collectionPath, requestInfo.newFileName+ '.json'), requestJSON, { encoding: 'utf8' });

    requestFromStore.splice(requestFromStore.findIndex(c => c.id === requestInfo.requestId), 1, requestById);
    store.set(REQUESTS_KEY, requestFromStore)

    console.log(`New requests ${JSON.stringify(requestFromStore)}`);

    return buildSuccessResultT(requestById);
  });

  //region clone-request
  ipcMain.handle('clone-request', async (event, requestInfo: CloneRequestDto) : Promise<ResultT<RequestModel, string>> => {
    
    console.log(`ipc-main-requests-initializer clone request: ${JSON.stringify(requestInfo)}`);

    if(!requestInfo.newFileName)
      return buildFailureResultT(`Новое название файла не может быть пустым`);
    if(!requestInfo.newName)
      return buildFailureResultT(`Новое название не может быть пустым`);
    if(!(await fs.promises.stat(requestInfo.collectionPath!)).isDirectory())
      return buildFailureResultT(`Коллекция ${requestInfo.collectionPath} не существует`);

    const requestsFromStore = store.get(REQUESTS_KEY, []);
    const requestFromStoreById = requestsFromStore.find(r => r.id === requestInfo.requestId);

    if(requestsFromStore.find(req => req.name === requestInfo.newName))
      return buildFailureResultT(`Запрос с таким именем уже существует`);
    if(requestsFromStore.find(req => req.fileName === requestInfo.newFileName))
      return buildFailureResultT(`Файл запроса с таким именем уже существует`);

    const clonedRequest = mapCloneDtoToRequestModel(requestFromStoreById!, requestInfo);

    console.log(`Object of cloned request: ${JSON.stringify(clonedRequest)}`);

    try {
      console.log(`Trying to write file by path: ${path.join(requestInfo.collectionPath!, requestInfo.newFileName)}`);
      await fs.promises.writeFile(path.join(requestInfo.collectionPath!, requestInfo.newFileName) + '.json', JSON.stringify(clonedRequest, null, 2), {encoding: `utf-8`});
    } catch (err) {
      return buildFailureResultT(`Ошибка при клонировании запроса`);
    }

    requestsFromStore.push(clonedRequest);

    store.set(REQUESTS_KEY, requestsFromStore);

    return buildSuccessResultT(clonedRequest);
  });

  //region open-request-in-fs

  ipcMain.handle('open-request-in-fs', async (event, requestInfo: OpenRequestInFSDto) : Promise<Result> => {
  
    console.log(`Trying to open request in fs: ${requestInfo.requestId}`);

    const request = store.get(REQUESTS_KEY, []).find(r => r.id === requestInfo.requestId);

    if(!requestInfo) return buildFailureResult("Запрос не найден");

    const fullPath = path.join(requestInfo.collectionPath, request!.fileName + '.json');
    
    fs.stat(fullPath, ((err, stat) => {
        if (err) {
            if (err.code === 'ENOENT') return buildFailureResultT('Запрос не найден в файловой системе');;
        }
        if (stat.isDirectory()) return buildFailureResultT('Путь до файла запроса некорректен');
    })) 

    const platformName = platform().toLowerCase().replace(/[0-9]/g, '').replace('darwin', 'macos');
    
    switch (platformName) {
        case 'win':
            console.log(`before spawn`);
            spawn('explorer.exe', ['/select,', fullPath], { 
                stdio: 'ignore', 
                detached: true 
            });
            console.log(`after spawn`);
            break;
        case 'linux':
            spawn('xdg-open', [fullPath]);
            break;
        case 'macos':
            spawn('open', [fullPath]);
            break;
        default:
            throw new Error("Неподдерживаемая ОС");
    }

    return buildSuccessResult();
});

//region delete-request

  ipcMain.handle('delete-request', async (event, requestInfo: DeleteRequestDto) : Promise<ResultT<RequestModel[], string>> => {
  
    console.log(`Trying to delete request ${requestInfo.requestId}`);

    const request = store.get(REQUESTS_KEY, []).find(r => r.id === requestInfo.requestId);

    if(!request) return buildFailureResultT("Запрос не найден");

    const fullPath = path.join(requestInfo.collectionPath, request.fileName + '.json');
    
    fs.stat(fullPath, ((err, stat) => {
        if (err) {
            if (err.code === 'ENOENT') return buildFailureResultT('Запрос не найден в файловой системе');
        }
        if (stat.isDirectory()) return buildFailureResultT('Путь до файла запроса некорректен');
    })) 

    try {
      await fs.promises.unlink(fullPath);
      console.log(`Файл успешно удален`);
    } catch (error) {
      return buildFailureResultT("Ошибка при удалении запроса");
    }

    const newRequests = store.get(REQUESTS_KEY).filter(r => r.id !== requestInfo.requestId);
    store.set(REQUESTS_KEY, newRequests);

    return buildSuccessResultT(newRequests);
  });

};

// region functions

function mapCloneDtoToRequestModel(baseRequest: RequestModel, cloneRequestDto: CloneRequestDto) : RequestModel {
  switch(baseRequest.type){
    case RequestTypes.HTTP:{
      return {
        id: uuidv4(),
        name: cloneRequestDto.newName,
        fileName: cloneRequestDto.newFileName,
        method: baseRequest.method,
        url: baseRequest.url,
        type: RequestTypes.HTTP,
        params: [],
        headers: baseRequest.headers,
        body: baseRequest.body,
        collectionId: baseRequest.collectionId
      }
    }
  }

  return undefined!;
}



function validateRenameRequestDto(requestInfo: RenameRequestDto){
    if(!requestInfo.newName){
        throw new Error(`Название запроса обязательно`);
    }

    if(!requestInfo.newFileName){
        throw new Error(`Название папки обязательно`);
    }

    if(!path.isAbsolute(requestInfo.collectionPath)){
        throw new Error(`Путь к файлу должен быть абсолютным`);
    }
}


  function mapCreateRequestModel(
    requestInfo: CreateRequestInfo,
    id: string
  ): HttpRequestModel {
    switch (requestInfo.type) {
      case RequestTypes.HTTP:
        return {
          id,
          name: requestInfo.name,
          type: RequestTypes.HTTP,
          method: requestInfo.method as HttpMethod,
          url: requestInfo.url,
          collectionId: requestInfo.collectionId, 
          fileName: requestInfo.name, 
          headers: [],
          body: {},
          params: []
        };

      // case RequestTypes.GRPC:
      //   // верни объект для gRPC
      //   return {
      //     id,
      //     filePath,
      //     name: requestInfo.name,
      //     type: RequestTypes.GRPC,
      //     headers: null,
      //     body: null,
      //   };

      // case RequestTypes.WEBSOCKET:
      //   // верни объект для WebSocket
      //   return {
      //     id,
      //     filePath,
      //     name: requestInfo.name,
      //     type: RequestTypes.WEBSOCKET
      //     headers: null,
      //     body: null,
      //   };

      default:
        throw new Error(`Unsupported request type: ${requestInfo.type}`);
    }
  }

function createRequestError<T>(errorMessage: string): ResultT<T, string>{
  return buildFailureResultT(errorMessage);
}
