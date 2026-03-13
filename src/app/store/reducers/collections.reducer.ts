import { createReducer, on, State } from "@ngrx/store";
import { CollectionState } from "../states/collection-state";
import { addCollectionSuccess, cloneCollectionSuccess, removeCollectionSuccess, loadCollections, loadCollectionsFailure, loadCollectionsSuccess, openCollectionSuccess, renameCollectionSuccess, moveCollection } from "../actions/collections.actions";
import { collectionsAdapter } from "../adapters/collection-adapter";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { selectAll } from "../selectors/collections.selector";
import { Collection } from "../../../../shared/models/collections/collection";

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
    on(loadCollectionsFailure, (state, { errorMessage: error }) => ({
        ...state,
        loading: false,
        error: error
    })),
    on(loadCollectionsSuccess, (state, { collections }) =>
        collectionsAdapter.setAll(collections, { ...state, loading: false })
    ),
    on(openCollectionSuccess, (state, {collection}) => 
        collectionsAdapter.addOne(collection, state)),

    on(removeCollectionSuccess, (state, {collections}) => 
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
        )),

    on(moveCollection, (state, {fromIndex: fromIndex, toIndex: toIndex}) => {
        const collections = Object.values(state.entities);
        console.log(`Коллекции перед перемещением: ${JSON.stringify(collections)}`);
        moveItemInArray(collections, fromIndex, toIndex);
        console.log(`Коллекции после перемещения: ${JSON.stringify(collections)}`);
        return collectionsAdapter.setAll(collections as Collection[], state);
    }
    )
    
)