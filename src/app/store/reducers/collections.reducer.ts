import { createReducer, on, State } from "@ngrx/store";
import { CollectionState } from "../states/collection-state";
import { addCollectionSuccess, cloneCollectionSuccess, closeCollectionSuccess, loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollectionSuccess, renameCollectionSuccess } from "../actions/collections.actions";
import { collectionsAdapter } from "../adapters/collection-adapter";

export const collectionFeatureKey = 'collections';

export const initialState: CollectionState = 
    collectionsAdapter.getInitialState({
        loading: false
    })
;

export const collectionsReducer = createReducer(
    initialState,
    on(loadCollections, state => ({...state})),
    on(addCollectionSuccess, (state, { collection }) =>
        collectionsAdapter.addOne(collection, state)
    ),
    on(loadCollectionsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    })),
    on(loadCollectionsSuccess, (state, { collections }) =>
        collectionsAdapter.setAll(collections, { ...state, loading: false })
    ),
    on(openCollectionSuccess, (state, {collection}) => 
        collectionsAdapter.addOne(collection, state)),

    on(closeCollectionSuccess, (state, {collections}) => 
        collectionsAdapter.setAll(collections, state)),

    on(cloneCollectionSuccess, (state, {clonedCollection: collection}) => 
        collectionsAdapter.addOne(collection, state)),
    on(renameCollectionSuccess, (state, {renamedCollection: collection}) => 
        collectionsAdapter.updateOne(
            {
                id: collection.id,
                changes: collection
            },
            state
        ))
    
)