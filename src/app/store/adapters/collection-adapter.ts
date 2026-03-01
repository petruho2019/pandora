import { createEntityAdapter } from "@ngrx/entity";
import { Collection } from "../../../../shared/models/collections/collection";

export const collectionsAdapter = createEntityAdapter<Collection>({
    selectId: collection => collection.id
});