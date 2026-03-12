import { RequestsStoreSchema } from './../shared/store/schemes/request-store-schema';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { IpcMain } from 'electron';
import { RequestModel, RequestType, RequestTypes } from '../shared/models/requests/request'
import { buildFailureResult, buildFailureResultT, buildSuccessResult, buildSuccessResultT, ResultT } from '../shared/models/result'
import { HttpMethod, HttpRequestModel, HttpRequestSchema } from '../shared/models/requests/http-request-model';
import { CreateRequestError } from '../shared/models/error/error';
import ElectronStore = require('electron-store');
import { CreateRequestInfo } from '../shared/models/event-models/add-request-info';
import { LoadRequestDto, RenameRequestDto } from '../shared/models/requests/dto/request-dtos';
import { COLLECTION_CONFIG_FILE_NAME } from '../shared/models/constants';
import { ZodError } from 'zod';

const REQUESTS_KEY = 'loadedRequests';


export function initializeRequest(store: ElectronStore<RequestsStoreSchema>, ipcMain: IpcMain) {

  //region add-request

  ipcMain.handle('add-request', async (event, { requestInfo }: {requestInfo: CreateRequestInfo}) : Promise<ResultT<HttpRequestModel, CreateRequestError>> => {
    try {

      console.log(`Check collectionPath`);
      // 1) Базовая валидация входа
      if (!requestInfo.collectionPath || typeof requestInfo.collectionPath !== 'string') {
        return createRequestError(`Путь к коллекции должен быть заполнен`);
      }
      if (!requestInfo) {
        return createRequestError(`Объект запроса null`);
      }

      console.log(`Check request name`);
      // 2) Проверяем минимальные поля
      const rawName = String(requestInfo.name ?? '').trim();
      if (!rawName) {
        return createRequestError(`Название запроса должно быть заполнено`);
      }

      console.log(`Check request name with regex`);

      const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/;

      if (invalidCharsRegex.test(rawName)) {
      return createRequestError(`Название файла содержит недопустимые символы`);
      }

      const safeName = rawName
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200);

      if (!safeName) {
      return createRequestError(`Название файла некорректно`);
      }
    
      console.log(`Check request type`);
      const requestTypes = Object.values(RequestTypes);
      const type = String(requestInfo.type ?? '').trim();

      console.log(`Request type is ${type}`);
      console.log(`Request types ${requestTypes}`);

      if (!requestTypes.includes(type as RequestType)) {
        return createRequestError(`Тип запроса должен быть из списка: ${requestTypes.join(', ')}`);
      }

      console.log(`Prepare file path`);

      // 3) Подготовка пути и имя файла
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

    // ipcMain.handle('open-collection-in-fs', async (event, collectionId: string) => {
  //   const coll = store.get(COLLECTIONS_KEY, []).find(c => c.id === collectionId);

  //   if(!coll)  throw new Error("Коллекция не найдена");
  //   if (!coll.path) throw new Error("Путь коллекции не найден");

  //   const platformName = platform().toLowerCase().replace(/[0-9]/g, '').replace('darwin', 'macos');
    
  //   switch (platformName) {
  //       case 'win':
  //           console.log(`before spawn`);
  //           spawn('explorer.exe', [coll.path], { 
  //               stdio: 'ignore', 
  //               detached: true 
  //           });
  //           console.log(`after spawn`);
  //           break;
  //       case 'linux':
  //           spawn('xdg-open', [coll.path]);
  //           break;
  //       case 'macos':
  //           spawn('open', [coll.path]);
  //           break;
  //       default:
  //           throw new Error("Неподдерживаемая ОС");
  //   }
    
  //   return true; 
  // });


  // region renane-request
  ipcMain.handle('rename-request', async (event, requestInfo: RenameRequestDto) : Promise<ResultT<RequestModel, string>> => {
    validateRenameRequestDto(requestInfo);

    console.log(`Rename request ${JSON.stringify(requestInfo)}`);

    const requestFromStore = store.get(REQUESTS_KEY, []);
    const requestById = requestFromStore.find(r => r.id === requestInfo.requestId);

    if(!requestById) return buildFailureResultT(`Запрос ${requestById.name} не найден`);

    requestById.name = requestInfo.newName;
    requestById.fileName = requestInfo.newFileName;

    console.log(`new request: ${JSON.stringify(requestById)}`);

    try {
      await fs.promises.rename(path.join(requestInfo.collectionPath, requestInfo.oldFileName + '.json'), path.join(requestInfo.collectionPath, requestInfo.newFileName+ '.json'));
    } catch (err) {
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

};


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
          headers: null,
          body: null,
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

function createRequestError<T>(errorMessage: string): ResultT<T, CreateRequestError>{
  return buildFailureResultT({
    message: errorMessage
  });
}
