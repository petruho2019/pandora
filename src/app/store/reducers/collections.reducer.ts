import { createReducer, on } from "@ngrx/store";
import { CollectionState } from "../states/collection-state";
import { loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollectionSuccess, moveCollection, openCollectionFailure, openCollectionInFSFailure } from "../actions/collections.actions";
import { collectionsAdapter } from "../adapters/collection-adapter";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { Collection } from "../../../../shared/models/collections/collection";
import { addCollectionModalSuccess, cloneCollectionModalSuccess, closeCollectionModalSuccess, deleteCollectionModalSuccess, renameCollectionModalSuccess } from "../actions/modal-actions/collections-modal.actions";

export const collectionFeatureKey = 'collections';

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
        'a1f1c1d1-0010-4a11-aaaa-aaaaaaaaaaaa'
    ],
    entities: {
        'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b': {
            id: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b',
            name: 'TEST 1 ajsdgajkshgdjkhagdkjgsajkdgjakgsdkjgasjdhg',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 1'
        } as Collection,

        '33abfac2-d678-481c-aa9a-39ac8361bd3e': {
            id: '33abfac2-d678-481c-aa9a-39ac8361bd3e',
            name: 'TEST 2',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 2'
        } as Collection,

        'a1f1c1d1-0001-4a11-aaaa-111111111111': {
            id: 'a1f1c1d1-0001-4a11-aaaa-111111111111',
            name: 'TEST 3',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 3'
        } as Collection,

        'a1f1c1d1-0002-4a11-aaaa-222222222222': {
            id: 'a1f1c1d1-0002-4a11-aaaa-222222222222',
            name: 'TEST 4',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 4'
        } as Collection,

        'a1f1c1d1-0003-4a11-aaaa-333333333333': {
            id: 'a1f1c1d1-0003-4a11-aaaa-333333333333',
            name: 'TEST 5',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 5'
        } as Collection,

        'a1f1c1d1-0004-4a11-aaaa-444444444444': {
            id: 'a1f1c1d1-0004-4a11-aaaa-444444444444',
            name: 'TEST 6',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 6'
        } as Collection,

        'a1f1c1d1-0005-4a11-aaaa-555555555555': {
            id: 'a1f1c1d1-0005-4a11-aaaa-555555555555',
            name: 'TEST 7',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 7'
        } as Collection,

        'a1f1c1d1-0006-4a11-aaaa-666666666666': {
            id: 'a1f1c1d1-0006-4a11-aaaa-666666666666',
            name: 'TEST 8',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 8'
        } as Collection,

        'a1f1c1d1-0007-4a11-aaaa-777777777777': {
            id: 'a1f1c1d1-0007-4a11-aaaa-777777777777',
            name: 'TEST 9',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 9'
        } as Collection,

        'a1f1c1d1-0008-4a11-aaaa-888888888888': {
            id: 'a1f1c1d1-0008-4a11-aaaa-888888888888',
            name: 'TEST 10',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 10'
        } as Collection,

        'a1f1c1d1-0009-4a11-aaaa-999999999999': {
            id: 'a1f1c1d1-0009-4a11-aaaa-999999999999',
            name: 'TEST 11',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 11'
        } as Collection,

        'a1f1c1d1-0010-4a11-aaaa-aaaaaaaaaaaa': {
            id: 'a1f1c1d1-0010-4a11-aaaa-aaaaaaaaaaaa',
            name: 'TEST 12',
            path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 12'
        } as Collection
    }
}

export const initialState: CollectionState = 
    collectionsAdapter.getInitialState({
        loading: false,
        error: null
    })
;

export const collectionsReducer = createReducer(
    initialState,

    //on(loadCollections, state => ({...state })),
    on(loadCollections, state => ({...INITIAL_TEST_STATE })),
    on(loadCollectionsSuccess, (state, { collections }) =>
        collectionsAdapter.setAll(collections, { ...state, loading: false })
    ),
    on(openCollectionSuccess, (state, {collection}) => 
        collectionsAdapter.addOne(collection, state)),

    on(moveCollection, (state, {fromIndex: fromIndex, toIndex: toIndex}) => {
        const collections = Object.values(state.entities);
        moveItemInArray(collections, fromIndex, toIndex);
        return collectionsAdapter.setAll(collections as Collection[], state);

    }),

    on(addCollectionModalSuccess, (state, { addedCollection }) =>
        collectionsAdapter.addOne(addedCollection, state)
    ),

    on(closeCollectionModalSuccess, (state, { newCollections }) => 
        collectionsAdapter.setAll(newCollections, state)),

    on(cloneCollectionModalSuccess, (state, {clonedCollection: collection}) => 
        collectionsAdapter.addOne(collection, state)),

    on(renameCollectionModalSuccess, (state, {renamedCollection: collection}) => 
        collectionsAdapter.updateOne(
            {
                id: collection.id,
                changes: collection
            },
            state
        )),

    on(deleteCollectionModalSuccess, (state, {newCollections: collections}) => 
        collectionsAdapter.setAll(collections, state)),
)