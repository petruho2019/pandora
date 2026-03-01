import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { CollectionsStoreSchema } from '../shared/store/schemes/collection-store-schema'
import { IpcMain } from 'electron';
import { RequestModel, RequestType, RequestTypes } from '../shared/models/requests/request'
import { buildFailureResultT, buildSuccessResultT, ResultT } from '../shared/models/result'
import { HttpMethod, HttpRequestModel } from '../shared/models/requests/http-request-model';
import { CreateRequestError } from '../shared/models/error/error';
import ElectronStore = require('electron-store');
import { CreateRequestInfo } from '../shared/models/event-models/add-request-info';
import { error } from 'console';

export function initializeRequest(store: ElectronStore<CollectionsStoreSchema>, ipcMain: IpcMain) {
  ipcMain.handle('add-request', async (event, { collectionPath, requestInfo }: {collectionPath: string, requestInfo: CreateRequestInfo}) : Promise<ResultT<HttpRequestModel, CreateRequestError>> => {

    try {

      console.log(`Check collectionPath`);
      // 1) Базовая валидация входа
      if (!collectionPath || typeof collectionPath !== 'string') {
        return createRequestError(`Путь к коллекции должен быть заполнен`);
      }
      if (!requestInfo || typeof requestInfo !== 'object') {
        return createRequestError(`requestInfo must be an object`);
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

      // if (type === 'HTTP') {
      //   const method = String(requestInfo.method ?? '').trim().toUpperCase();
      //   const url = String(requestInfo.url ?? '').trim();

      //   console.log(`Request method ${method}`);

      //   if (!HttpMethods.includes(method as HttpMethod)) {
      //     return result(false, { error: 'invalid_method', message: `Метод должен быть из списка: ${HttpMethods.join(', ')}` });
      //   }
      //   if (!url) {
      //     return result(false, { error: 'invalid_url', message: 'Необходимо ввести путь запроса' });
      //   }
      //   // Опционально: базовая проверка URL (не строгая)
      //   try {
      //     console.log(`Url path ${url}`);
      //     // если нужно требовать схемы (http/https) - оставить; иначе можно убрать.
      //     new URL(url);
      //   } catch {
      //     return result(false, { error: 'invalid_url_format', message: 'Путь запроса некорректен' });
      //   }
      // }

      console.log(`Prepare file path`);

      // 3) Подготовка пути и имя файла
      const resolvedPath = path.resolve(collectionPath);
      const finalFileName = `${safeName}.json`;
      const finalPath = path.join(resolvedPath, finalFileName);


      console.log(`Check file does not exist`);
      // 4) Проверка существования по имени (case-insensitive среди .json файлов)
      const dirFiles = await fs.promises.readdir(resolvedPath);
      const hasDuplicate = dirFiles.some(f => {
        if (path.extname(f).toLowerCase() !== '.json') return false;
        const base = path.basename(f, '.json');
        return base.toLowerCase() === safeName.toLowerCase();
      });
      if (hasDuplicate) {
        return createRequestError("Запрос с таким именем уже есть");
      }

      // 5) Подготовка сохраняемого объекта
      const savedRequest: RequestModel = mapCreateRequestModel(requestInfo, uuidv4(), finalPath);

      // 6) Атомарная запись: временный файл + переименование
      const payload = JSON.stringify(savedRequest, null, 2);

      console.log(`Payload: ${payload}`);
      console.log(`FinalPath: ${finalPath}`);

      await fs.promises.writeFile(finalPath, payload, { encoding: 'utf8' });

      return buildSuccessResultT(savedRequest);
    } catch (err: any) {
      console.error(`Log from ipcMain ERROR ${err}`);
      return buildFailureResultT(err?.message ?? String(err));
    }
  });


  function mapCreateRequestModel(
    requestInfo: CreateRequestInfo,
    id: string,
    filePath: string
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


}

function createRequestError<T>(errorMessage: string): ResultT<T, CreateRequestError>{
  return buildFailureResultT({
    message: errorMessage
  });
}
