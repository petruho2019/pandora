import { createReducer, on } from '@ngrx/store';
import { CollectionState } from '../states/states';
import {
  loadCollections,
  loadCollectionsSuccess,
  openCollectionSuccess,
  moveCollection,
  updateCollectionHeadersSuccess,
  updateCollectionAuthSuccess,
} from '../actions/collections.actions';
import { collectionsAdapter } from '../adapters/adapters';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Collection } from '../../../../shared/models/collections/collection';
import {
  addCollectionModalSuccess,
  cloneCollectionModalSuccess,
  closeCollectionModalSuccess,
  deleteCollectionModalSuccess,
  renameCollectionModalSuccess,
} from '../actions/modal-actions/collections-modal.actions';
import { TableRow } from '../../../../shared/models/requests/request';
import { CollectionYmlConfig } from '../../../../shared/models/collections/collection-config';
import {
  AUTH_KIND,
  AuthKind,
  HttpBasicAuth,
  HttpBearerAuth,
} from '../../../../shared/models/requests/http/auth';
import { AuthItem } from '../../../../shared/models/requests/http/http-request-model';

export const collectionFeatureKey = 'collections';

const makeRow = (id: string, name: string, value: string, isActive = true): TableRow => ({
  id,
  isActive,
  name,
  value,
  fileInfo: null,
});

const makeConfig = (
  id: string,
  name: string,
  headers: TableRow[] = [],
  auth: Record<AuthKind, AuthItem> = makeAuth(),
): CollectionYmlConfig => ({
  collectionInfo: {
    id,
    name,
  },
  collectionSettings: {
    headers,
    auth,
  },
});

const makeAuth = (options?: {
  basic?: Partial<Omit<HttpBasicAuth, 'kind' | 'name'>>;
  bearer?: Partial<Omit<HttpBearerAuth, 'kind' | 'name'>>;
}): Record<AuthKind, AuthItem> => ({
  [AUTH_KIND.BASIC]: {
    kind: 'basic',
    name: 'Базовая',
    username: null,
    password: null,
    ...options?.basic,
  },
  [AUTH_KIND.BEARER]: {
    kind: 'bearer',
    name: 'Bearer токен',
    token: null,
    ...options?.bearer,
  },
  [AUTH_KIND.INHERIT]: {
    kind: 'bearer',
    name: 'Bearer токен',
    token: null,
    ...options?.bearer,
  },
  [AUTH_KIND.NONE]: {
    kind: 'none',
    name: 'Без аутентификации',
  },
});

const INITIAL_TEST_STATE: CollectionState = {
  loading: false,
  error: null,
  ids: [
    'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b',
    '33abfac2-d678-481c-aa9a-39ac8361bd3e',
    'a1f1c1d1-0001-4a11-aaaa-111111111111',
    'a1f1c1d1-0002-4a11-aaaa-222222222222',
    'a1f1c1d1-0003-4a11-aaaa-333333333333',
    'a1f1c1d1-0004-4a11-aaaa-444444444444',
    'a1f1c1d1-0005-4a11-aaaa-555555555555',
    'a1f1c1d1-0006-4a11-aaaa-666666666666',
    'a1f1c1d1-0007-4a11-aaaa-777777777777',
    'a1f1c1d1-0008-4a11-aaaa-888888888888',
    'a1f1c1d1-0009-4a11-aaaa-999999999999',
    'a1f1c1d1-0010-4a11-aaaa-aaaaaaaaaaaa',
  ],
  entities: {
    'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b': {
      id: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b',
      name: 'TEST 1 ajsdgajkshgdjkhagdkjgsajkdgjakgsdkjgasjdhgsdf;kjjhsdlkjfj;lsdfgjk;lkdsjfhl;kjdjsfgl;kjdsfg;jsdfglkjsdhfgljkshdfgkjhhsdfgkjhsdfjkghsdkjfghksdjfghkjsdfghkjsdfhgjksdhfgkjsdhfgkjsdfhgkjdshfgkjdshfgkjdgfs',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 1',
      collectionConfig: makeConfig(
        '3d0f3c0f-6c2d-4d8f-8b1a-8f7e8f5d2f01',
        'TEST 1',
        [
          makeRow('9c2b4f0a-1d55-4c1c-8e9d-2ed7f72d4a11', 'Title', 'Header title 1'),
          makeRow('5f7c1d22-7f21-4cc3-8f5f-4b4b2e8b7b12', 'Status', 'Active'),
          makeRow('c1a9e6a0-6c0f-4e7c-9cdb-91a0f4c5e813', 'Type', 'Primary'),
        ],
        makeAuth({ basic: { username: 'admin', password: 'admin123' } }),
      ),
    } as Collection,

    '33abfac2-d678-481c-aa9a-39ac8361bd3e': {
      id: '33abfac2-d678-481c-aa9a-39ac8361bd3e',
      name: 'TEST 2',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 2',
      collectionConfig: makeConfig(
        'a7d4d7fd-6d0f-4d8f-8b4a-4c9e4a1d3b21',
        'Collection 2',
        [
          makeRow('f4f7b0f0-8d1c-4a3e-9f35-7b0a5d3d9a31', 'Category', 'General'),
          makeRow('0c8e7f9d-3f2a-4c4f-8c92-6a8d2b1f6b32', 'Count', '12'),
          makeRow('bbd9d6b1-5e6f-4d8f-9a5c-1e2f3a4b7c33', 'Mode', 'Default'),
        ],
        makeAuth({ bearer: { token: 'test-bearer-token-2' } }),
      ),
    } as Collection,

    'a1f1c1d1-0001-4a11-aaaa-111111111111': {
      id: 'a1f1c1d1-0001-4a11-aaaa-111111111111',
      name: 'TEST 3',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 3',
      collectionConfig: makeConfig(
        'e2e7d4a3-1b6d-4b9a-8f3d-3b7c9d0e4f41',
        'TEST 3 config',
        [
          makeRow('1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c51', 'Owner', 'Admin'),
          makeRow('2b3c4d5e-6f70-4a8b-9cad-1e2f3a4b5c52', 'UpdatedAt', '2026-01-01'),
        ],
        makeAuth(),
      ),
    } as Collection,

    'a1f1c1d1-0002-4a11-aaaa-222222222222': {
      id: 'a1f1c1d1-0002-4a11-aaaa-222222222222',
      name: 'TEST 4',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 4',
      collectionConfig: makeConfig(
        '7f6e5d4c-3b2a-4a19-8c7d-6e5f4a3b2c61',
        'TEST 4',
        [
          makeRow('8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c71', 'Mode', 'Manual'),
          makeRow('9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d72', 'Enabled', 'true'),
          makeRow('0c1d2e3f-4a5b-4c6d-8e7f-8a9b0c1d2e73', 'Priority', 'High'),
          makeRow('1d2e3f4a-5b6c-4d7e-8f90-9a0b1c2d3e74', 'Source', 'Local'),
        ],
        makeAuth({ basic: { username: 'tester4', password: 'pass4' } }),
      ),
    } as Collection,

    'a1f1c1d1-0003-4a11-aaaa-333333333333': {
      id: 'a1f1c1d1-0003-4a11-aaaa-333333333333',
      name: 'TEST 5',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 5',
      collectionConfig: makeConfig(
        '4a3b2c1d-5e6f-4a7b-8c9d-0e1f2a3b4c81',
        'Config for TEST 5',
        [
          makeRow('5b6c7d8e-9f0a-4b1c-8d2e-3f4a5b6c7d82', 'Path', 'D:\\temp\\test-5'),
          makeRow('6c7d8e9f-0a1b-4c2d-8e3f-4a5b6c7d8e83', 'Comment', 'Sample header set'),
        ],
        makeAuth({ bearer: { token: 'token-5' } }),
      ),
    } as Collection,

    'a1f1c1d1-0004-4a11-aaaa-444444444444': {
      id: 'a1f1c1d1-0004-4a11-aaaa-444444444444',
      name: 'TEST 6',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 6',
      collectionConfig: makeConfig(
        '2c1d0e9f-8b7a-4c6d-9e0f-1a2b3c4d5e91',
        'TEST 6 alias',
        [
          makeRow('3d2c1b0a-9f8e-4d6c-8b7a-6c5d4e3f2a92', 'Key', 'k1'),
          makeRow('4e3d2c1b-0a9f-4e6d-8c7b-5d4e3f2a1b93', 'Value', 'v1'),
          makeRow('5f4e3d2c-1b0a-4f7e-8d6c-4e3f2a1b0c94', 'IsVisible', 'false'),
        ],
        makeAuth({ bearer: { token: 'token-6' } }),
      ),
    } as Collection,

    'a1f1c1d1-0005-4a11-aaaa-555555555555': {
      id: 'a1f1c1d1-0005-4a11-aaaa-555555555555',
      name: 'TEST 7',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 7',
      collectionConfig: makeConfig(
        'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d95',
        'TEST 7',
        [],
        makeAuth({ basic: { username: 'user7', password: 'pass7' } }),
      ),
    } as Collection,

    'a1f1c1d1-0006-4a11-aaaa-666666666666': {
      id: 'a1f1c1d1-0006-4a11-aaaa-666666666666',
      name: 'TEST 8',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 8',
      collectionConfig: makeConfig(
        'c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e96',
        'Collection Eight',
        [],
        makeAuth({ bearer: { token: 'token-8' } }),
      ),
    } as Collection,

    'a1f1c1d1-0007-4a11-aaaa-777777777777': {
      id: 'a1f1c1d1-0007-4a11-aaaa-777777777777',
      name: 'TEST 9',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 9',
      collectionConfig: makeConfig(
        'd3e4f5a6-b7c8-4d9e-8f0a-1b2c3d4e5f97',
        'TEST 9 config',
        [],
        makeAuth(),
      ),
    } as Collection,

    'a1f1c1d1-0008-4a11-aaaa-888888888888': {
      id: 'a1f1c1d1-0008-4a11-aaaa-888888888888',
      name: 'TEST 10',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 10',
      collectionConfig: makeConfig(
        'e4f5a6b7-c8d9-4e0f-8a1b-2c3d4e5f6a98',
        'Another name for 10',
        [],
        makeAuth({ basic: { username: 'user10', password: 'pass10' } }),
      ),
    } as Collection,

    'a1f1c1d1-0009-4a11-aaaa-999999999999': {
      id: 'a1f1c1d1-0009-4a11-aaaa-999999999999',
      name: 'TEST 11',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 11',
      collectionConfig: makeConfig(
        'f5a6b7c8-d9e0-4f1a-8b2c-3d4e5f6a7b99',
        'TEST 11',
        [],
        makeAuth({ bearer: { token: 'token-11' } }),
      ),
    } as Collection,

    'a1f1c1d1-0010-4a11-aaaa-aaaaaaaaaaaa': {
      id: 'a1f1c1d1-0010-4a11-aaaa-aaaaaaaaaaaa',
      name: 'TEST 12',
      path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 12',
      collectionConfig: makeConfig(
        '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c10',
        'TEST 12',
        [],
        makeAuth(),
      ),
    } as Collection,
  },
};

export const initialState: CollectionState = collectionsAdapter.getInitialState({
  loading: false,
  error: null,
});

export const collectionsReducer = createReducer(
  initialState,

  //on(loadCollections, state => ({...state })),
  on(loadCollections, (state) => ({ ...INITIAL_TEST_STATE })),
  on(loadCollectionsSuccess, (state, { collections }) =>
    collectionsAdapter.setAll(collections, { ...state, loading: false }),
  ),
  on(openCollectionSuccess, (state, { collection }) =>
    collectionsAdapter.addOne(collection, state),
  ),

  on(moveCollection, (state, { fromIndex: fromIndex, toIndex: toIndex }) => {
    const collections = Object.values(state.entities);
    moveItemInArray(collections, fromIndex, toIndex);
    return collectionsAdapter.setAll(collections as Collection[], state);
  }),

  on(addCollectionModalSuccess, (state, { addedCollection }) =>
    collectionsAdapter.addOne(addedCollection, state),
  ),

  on(closeCollectionModalSuccess, (state, { newCollections }) =>
    collectionsAdapter.setAll(newCollections, state),
  ),

  on(cloneCollectionModalSuccess, (state, { clonedCollection: collection }) =>
    collectionsAdapter.addOne(collection, state),
  ),

  on(renameCollectionModalSuccess, (state, { renamedCollection: collection }) =>
    collectionsAdapter.updateOne(
      {
        id: collection.id,
        changes: collection,
      },
      state,
    ),
  ),

  on(deleteCollectionModalSuccess, (state, { newCollections }) =>
    collectionsAdapter.setAll(newCollections, state),
  ),
  on(updateCollectionHeadersSuccess, (state, { coll }) =>
    collectionsAdapter.updateOne(
      {
        id: coll.id,
        changes: coll,
      },
      state,
    ),
  ),
  on(updateCollectionAuthSuccess, (state, { coll }) =>
    collectionsAdapter.updateOne(
      {
        id: coll.id,
        changes: coll,
      },
      state,
    ),
  ),
);
