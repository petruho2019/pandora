import { createReducer, on } from "@ngrx/store";
import { CollectionState } from "../states/collection-state";
import { loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollectionSuccess, moveCollection, openCollectionFailure, openCollectionInFSFailure } from "../actions/collections.actions";
import { collectionsAdapter } from "../adapters/collection-adapter";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { Collection } from "../../../../shared/models/collections/collection";
import { addCollectionModalSuccess, cloneCollectionModalSuccess, removeCollectionModalSuccess, renameCollectionModalSuccess } from "../actions/modal-actions/collections-modal.actions";

export const collectionFeatureKey = 'collections';

export const initialState: CollectionState = 
    collectionsAdapter.getInitialState({
        loading: false,
        error: null
    })
;

export const collectionsReducer = createReducer(
    initialState,

    on(loadCollections, state => ({...state})),
    on(loadCollectionsSuccess, (state, { collections }) =>
        collectionsAdapter.setAll(collections, { ...state, loading: false })
    ),
    on(loadCollectionsFailure, (state, { errorMessage: error }) => ({
        ...state,
        loading: false,
        error: error
    })),

    on(openCollectionSuccess, (state, {collection}) => 
        collectionsAdapter.addOne(collection, state)),
    on(openCollectionFailure, (state, { errorMessage: error }) => ({
        ...state,
        loading: false,
        error: error
    })),

    on(moveCollection, (state, {fromIndex: fromIndex, toIndex: toIndex}) => {

        const collections = Object.values(state.entities);
        moveItemInArray(collections, fromIndex, toIndex);
        return collectionsAdapter.setAll(collections as Collection[], state);

    }),

    on(openCollectionInFSFailure, (state) => ({
        ...state, error: "Непредвиденная ошибка при открытии коллекции в ФС"
    })),

    on(addCollectionModalSuccess, (state, { addedCollection }) =>
        collectionsAdapter.addOne(addedCollection, state)
    ),

    on(removeCollectionModalSuccess, (state, { newCollections }) => 
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
    
)