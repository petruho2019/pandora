import { BrowserWindow, dialog, IpcMain } from 'electron';
import { buildFailureResultT, buildSuccessResultT, Result, ResultT } from '../shared/models/result';
import * as fs from 'fs';

export function initializeCommon(ipcMain: IpcMain) {
  //#region open-file
  ipcMain.handle('open-file', async (): Promise<ResultT<string, null>> => {
    const file = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
      properties: ['openFile'],
      title: 'Выберите файл',
    });

    return buildSuccessResultT(file.filePaths[0]);
  });

  //#region file-exists
  ipcMain.handle('file-exists', async (event, path: string): Promise<ResultT<boolean, string>> => {
    try {
      const stats = await fs.promises.stat(path);

      if (stats.isFile()) {
        return buildSuccessResultT(true);
      }

      if (stats.isDirectory()) {
        return buildFailureResultT('Выбрана папка, а не файл');
      }

      return buildFailureResultT('Объект не является файлом');
    } catch (err: any) {
      switch (err.code) {
        case 'ENOENT':
          return buildFailureResultT('Файл не найден');

        case 'EACCES':
          return buildFailureResultT('Нет доступа к файлу');

        default:
          return buildFailureResultT(`Ошибка при проверке файла: ${err.message}`);
      }
    }
  });

  //#region get-file-stream

  ipcMain.handle(
    'get-file-stream',
    async (event, path: string): Promise<ResultT<fs.ReadStream, string>> => {
      try {
        return buildSuccessResultT(fs.createReadStream(path));
      } catch (err: any) {
        switch (err.code) {
          case 'ENOENT':
            return buildFailureResultT('Файл не найден');

          case 'EACCES':
            return buildFailureResultT('Нет доступа к файлу');

          default:
            return buildFailureResultT(`Ошибка при отправке файла: ${getFileNameFromPath(path)}`);
        }
      }
    },
  );

  //#region functions

  function getFileNameFromPath(path: string) {
    if (!path) return null;

    return path.replace(/\\/g, '/').split('/').pop();
  }
}
