import { createReducer, on } from '@ngrx/store';
import { filesAdapter } from '../adapters/file-adapter';
import { FileState } from '../states/files-state';
import { addFileSuccess } from '../actions/common.actions';
import { v4 as uuidv4 } from 'uuid';

export const fileFeatureKey = 'files';

export const initialState: FileState = filesAdapter.getInitialState();

export const filesReducer = createReducer(
  initialState,

  on(addFileSuccess, (state, { fileDto }) => {
    console.log(`filesReducer добавляем file: ${JSON.stringify(fileDto, null, 2)}`);
    return filesAdapter.addOne(
      {
        id: uuidv4(),
        reqId: fileDto.reqId,
        tableRowId: fileDto.tableRowId,
        filePath: fileDto.filePath,
        contentType: fileDto.contentType,
      },
      state,
    );
  }),
);
