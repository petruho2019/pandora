import { EntityState } from '@ngrx/entity';
import { FileModel } from '../../../../shared/models/files/file';

export interface FileState extends EntityState<FileModel> {}
