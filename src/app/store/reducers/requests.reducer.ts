import { createReducer, on } from "@ngrx/store";
import { RequestState } from "../states/request-state";
import { requestAdapter } from "../adapters/request-adapter";
import { loadRequestsSuccess, moveRequest, updateRequestSuccess } from "../actions/requests.actions";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { RequestModel } from "../../../../shared/models/requests/request";
import { cloneRequestSuccess, createRequestSuccess, deleteRequestSuccess, renameRequestSuccess } from "../actions/modal-actions/request-modal.actions";
import { buildDefaultAuth, buildDefaultBody } from "../../../../shared/models/requests/http/http-request-model";

export const requestFeatureKey = 'requests';
export const INITIAL_REQUESTS_STATE: RequestState = {
  ids: [
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000014',
    '10000000-0000-4000-8000-000000000015',
    '10000000-0000-4000-8000-000000000016',
    '10000000-0000-4000-8000-000000000017',
    '10000000-0000-4000-8000-000000000018',
    '10000000-0000-4000-8000-000000000019',
    '10000000-0000-4000-8000-000000000020',

    '20000000-0000-4000-8000-000000000021',
    '20000000-0000-4000-8000-000000000022',
    '20000000-0000-4000-8000-000000000023',
    '20000000-0000-4000-8000-000000000024',
    '20000000-0000-4000-8000-000000000025',
    '20000000-0000-4000-8000-000000000026',
    '20000000-0000-4000-8000-000000000027',
    '20000000-0000-4000-8000-000000000028',
    '20000000-0000-4000-8000-000000000029',
    '20000000-0000-4000-8000-000000000030',
    '20000000-0000-4000-8000-000000000031',
    '20000000-0000-4000-8000-000000000032',
    '20000000-0000-4000-8000-000000000033',
    '20000000-0000-4000-8000-000000000034',
    '20000000-0000-4000-8000-000000000035',
    '20000000-0000-4000-8000-000000000036',
    '20000000-0000-4000-8000-000000000037',
    '20000000-0000-4000-8000-000000000038',
    '20000000-0000-4000-8000-000000000039',
    '20000000-0000-4000-8000-000000000040',
  ],

  entities: {
    '10000000-0000-4000-8000-000000000001': { id: '10000000-0000-4000-8000-000000000001', name: 'Get users', type: 'HTTP', method: 'GET', url: '/api/users', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'get-users' },
    '10000000-0000-4000-8000-000000000002': { id: '10000000-0000-4000-8000-000000000002', name: 'Get user by id', type: 'HTTP', method: 'GET', url: '/api/users/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'get-user-by-id' },
    '10000000-0000-4000-8000-000000000003': { id: '10000000-0000-4000-8000-000000000003', name: 'Get posts', type: 'HTTP', method: 'GET', url: '/api/posts', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'get-posts' },
    '10000000-0000-4000-8000-000000000004': { id: '10000000-0000-4000-8000-000000000004', name: 'Create user', type: 'HTTP', method: 'POST', url: '/api/users', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'create-user' },
    '10000000-0000-4000-8000-000000000005': { id: '10000000-0000-4000-8000-000000000005', name: 'Create post', type: 'HTTP', method: 'POST', url: '/api/posts', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'create-post' },
    '10000000-0000-4000-8000-000000000006': { id: '10000000-0000-4000-8000-000000000006', name: 'Create comment', type: 'HTTP', method: 'POST', url: '/api/comments', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'create-comment' },
    '10000000-0000-4000-8000-000000000007': { id: '10000000-0000-4000-8000-000000000007', name: 'Update user', type: 'HTTP', method: 'PUT', url: '/api/users/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'update-user' },
    '10000000-0000-4000-8000-000000000008': { id: '10000000-0000-4000-8000-000000000008', name: 'Update post', type: 'HTTP', method: 'PUT', url: '/api/posts/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'update-post' },
    '10000000-0000-4000-8000-000000000009': { id: '10000000-0000-4000-8000-000000000009', name: 'Patch user', type: 'HTTP', method: 'PATCH', url: '/api/users/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'patch-user' },
    '10000000-0000-4000-8000-000000000010': { id: '10000000-0000-4000-8000-000000000010', name: 'Patch post', type: 'HTTP', method: 'PATCH', url: '/api/posts/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'patch-post' },
    '10000000-0000-4000-8000-000000000011': { id: '10000000-0000-4000-8000-000000000011', name: 'Delete user', type: 'HTTP', method: 'DELETE', url: '/api/users/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'delete-user' },
    '10000000-0000-4000-8000-000000000012': { id: '10000000-0000-4000-8000-000000000012', name: 'Delete post', type: 'HTTP', method: 'DELETE', url: '/api/posts/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'delete-post' },
    '10000000-0000-4000-8000-000000000013': { id: '10000000-0000-4000-8000-000000000013', name: 'Search users', type: 'HTTP', method: 'GET', url: '/api/users/search', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'search-users' },
    '10000000-0000-4000-8000-000000000014': { id: '10000000-0000-4000-8000-000000000014', name: 'Search posts', type: 'HTTP', method: 'GET', url: '/api/posts/search', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'search-posts' },
    '10000000-0000-4000-8000-000000000015': { id: '10000000-0000-4000-8000-000000000015', name: 'Login', type: 'HTTP', method: 'POST', url: '/api/auth/login', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'login' },
    '10000000-0000-4000-8000-000000000016': { id: '10000000-0000-4000-8000-000000000016', name: 'Register', type: 'HTTP', method: 'POST', url: '/api/auth/register', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'register' },
    '10000000-0000-4000-8000-000000000017': { id: '10000000-0000-4000-8000-000000000017', name: 'Refresh token', type: 'HTTP', method: 'POST', url: '/api/auth/refresh', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'refresh-token' },
    '10000000-0000-4000-8000-000000000018': { id: '10000000-0000-4000-8000-000000000018', name: 'Get profile', type: 'HTTP', method: 'GET', url: '/api/profile', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'get-profile' },
    '10000000-0000-4000-8000-000000000019': { id: '10000000-0000-4000-8000-000000000019', name: 'Update profile', type: 'HTTP', method: 'PUT', url: '/api/profile', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'update-profile' },
    '10000000-0000-4000-8000-000000000020': { id: '10000000-0000-4000-8000-000000000020', name: 'Delete account', type: 'HTTP', method: 'DELETE', url: '/api/account', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', fileName: 'delete-account' },

    '20000000-0000-4000-8000-000000000021': { id: '20000000-0000-4000-8000-000000000021', name: 'Get products', type: 'HTTP', method: 'GET', url: '/api/products', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'get-products' },
    '20000000-0000-4000-8000-000000000022': { id: '20000000-0000-4000-8000-000000000022', name: 'Get product by id', type: 'HTTP', method: 'GET', url: '/api/products/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'get-product-by-id' },
    '20000000-0000-4000-8000-000000000023': { id: '20000000-0000-4000-8000-000000000023', name: 'Get categories', type: 'HTTP', method: 'GET', url: '/api/categories', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'get-categories' },
    '20000000-0000-4000-8000-000000000024': { id: '20000000-0000-4000-8000-000000000024', name: 'Create product', type: 'HTTP', method: 'POST', url: '/api/products', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'create-product' },
    '20000000-0000-4000-8000-000000000025': { id: '20000000-0000-4000-8000-000000000025', name: 'Create category', type: 'HTTP', method: 'POST', url: '/api/categories', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'create-category' },
    '20000000-0000-4000-8000-000000000026': { id: '20000000-0000-4000-8000-000000000026', name: 'Create order', type: 'HTTP', method: 'POST', url: '/api/orders', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'create-order' },
    '20000000-0000-4000-8000-000000000027': { id: '20000000-0000-4000-8000-000000000027', name: 'Update product', type: 'HTTP', method: 'PUT', url: '/api/products/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'update-product' },
    '20000000-0000-4000-8000-000000000028': { id: '20000000-0000-4000-8000-000000000028', name: 'Update category', type: 'HTTP', method: 'PUT', url: '/api/categories/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'update-category' },
    '20000000-0000-4000-8000-000000000029': { id: '20000000-0000-4000-8000-000000000029', name: 'Patch product', type: 'HTTP', method: 'PATCH', url: '/api/products/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'patch-product' },
    '20000000-0000-4000-8000-000000000030': { id: '20000000-0000-4000-8000-000000000030', name: 'Patch category', type: 'HTTP', method: 'PATCH', url: '/api/categories/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'patch-category' },
    '20000000-0000-4000-8000-000000000031': { id: '20000000-0000-4000-8000-000000000031', name: 'Delete product', type: 'HTTP', method: 'DELETE', url: '/api/products/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'delete-product' },
    '20000000-0000-4000-8000-000000000032': { id: '20000000-0000-4000-8000-000000000032', name: 'Delete category', type: 'HTTP', method: 'DELETE', url: '/api/categories/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'delete-category' },
    '20000000-0000-4000-8000-000000000033': { id: '20000000-0000-4000-8000-000000000033', name: 'Get orders', type: 'HTTP', method: 'GET', url: '/api/orders', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'get-orders' },
    '20000000-0000-4000-8000-000000000034': { id: '20000000-0000-4000-8000-000000000034', name: 'Get order by id', type: 'HTTP', method: 'GET', url: '/api/orders/1', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'get-order-by-id' },
    '20000000-0000-4000-8000-000000000035': { id: '20000000-0000-4000-8000-000000000035', name: 'Create invoice', type: 'HTTP', method: 'POST', url: '/api/invoices', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'create-invoice' },
    '20000000-0000-4000-8000-000000000036': { id: '20000000-0000-4000-8000-000000000036', name: 'Send invoice', type: 'HTTP', method: 'POST', url: '/api/invoices/send', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'send-invoice' },
    '20000000-0000-4000-8000-000000000037': { id: '20000000-0000-4000-8000-000000000037', name: 'Get stats', type: 'HTTP', method: 'GET', url: '/api/stats', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'get-stats' },
    '20000000-0000-4000-8000-000000000038': { id: '20000000-0000-4000-8000-000000000038', name: 'Sync catalog', type: 'HTTP', method: 'POST', url: '/api/catalog/sync', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'sync-catalog' },
    '20000000-0000-4000-8000-000000000039': { id: '20000000-0000-4000-8000-000000000039', name: 'Import products', type: 'HTTP', method: 'POST', url: '/api/products/import', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'import-products' },
    '20000000-0000-4000-8000-000000000040': { id: '20000000-0000-4000-8000-000000000040', name: 'Export products', type: 'HTTP', method: 'GET', url: '/api/products/export', headers: [], params: [], auth: buildDefaultAuth(), body: buildDefaultBody(), collectionId: '33abfac2-d678-481c-aa9a-39ac8361bd3e', fileName: 'export-products' },
    },

  loadedByCollectionId: new Map([
    ['dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', true],
    ['33abfac2-d678-481c-aa9a-39ac8361bd3e', true],
  ])
};


export const initialState: RequestState = {
    ...requestAdapter.getInitialState(),
    loadedByCollectionId: new Map<string, boolean>()
};

export const requestsReducer = createReducer(
    initialState,
    on(loadRequestsSuccess, (state, {loadedRequests: requests, collectionId}) => {
        console.log(`Запросы: ${JSON.stringify(requests)}, id коллекции: ${collectionId}`);
        state.loadedByCollectionId.set(collectionId, true);
        return requestAdapter.addMany(requests, state);
    }),
    
    on(createRequestSuccess, (state, { request }) => 
        requestAdapter.addOne(request, state)
    ),

    on(renameRequestSuccess, (state, {renamedRequest: req}) => 
        requestAdapter.updateOne({
            id: req.id,
            changes: req
        }, state)
    ),

    on(moveRequest, (state, {fromIndex: fromIndex, toIndex: toIndex}) => {
        const requests = Object.values(state.entities);
        console.log(`Запросы перед перемещением: ${JSON.stringify(requests)}`);
        moveItemInArray(requests, fromIndex, toIndex);
        console.log(`Запросы после перемещения: ${JSON.stringify(requests)}`);
        return requestAdapter.setAll(requests as RequestModel[], state);
    }),

    on(cloneRequestSuccess, (state, {clonedRequest}) => 
        requestAdapter.addOne(clonedRequest, {...state, error: null})
    ),

    on(deleteRequestSuccess, (state, { newRequests }) => 
        requestAdapter.setAll(newRequests, state )
    ),

    on(updateRequestSuccess, (state, {req: req}) => 
    requestAdapter.updateOne(
        {
            id: req.id,
            changes: req
        }, state)),
);
 