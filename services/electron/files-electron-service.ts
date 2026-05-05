import { Injectable } from '@angular/core';
import { ResultT } from '../../shared/models/result';

@Injectable({ providedIn: 'root' })
export class FilesElectronService {
  openFile(): Promise<ResultT<string, string>> {
    return (window as any).electronAPI?.openFile();
  }

  fileExists(path: string): Promise<ResultT<string, string>> {
    return (window as any).electronAPI?.fileExists(path);
  }

  getFileStream(path: string): Promise<ResultT<string, string>> {
    return (window as any).electronAPI?.getFileStream(path);
  }
}
