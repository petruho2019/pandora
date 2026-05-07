import { createReducer, on } from '@ngrx/store';
import { addFileSuccess } from '../actions/common.actions';
import { v4 as uuidv4 } from 'uuid';
import { FileState } from '../states/states';
import { filesAdapter } from '../adapters/adapters';

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
