import { createEntityAdapter } from '@ngrx/entity';
import { FileModel } from '../../../../shared/models/files/file';

export const filesAdapter = createEntityAdapter<FileModel>({
  selectId: (file) => file.id,
});
