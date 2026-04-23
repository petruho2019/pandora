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
    ids: ['dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', '33abfac2-d678-481c-aa9a-39ac8361bd3e'],
    entities: {
        'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b': { id: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', name: 'TEST 1 ajsdgajkshgdjkhagdkjgsajkdgjakgsdkjgasjdhg', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 1' } as Collection,
        '33abfac2-d678-481c-aa9a-39ac8361bd3e': { id: '33abfac2-d678-481c-aa9a-39ac8361bd3e', name: 'TEST 2', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 2' } as Collection
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