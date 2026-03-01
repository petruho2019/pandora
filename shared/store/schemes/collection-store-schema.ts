import { Collection } from "../../models/collections/collection";

export interface CollectionsStoreSchema {
  loadedCollections: Collection[];
}