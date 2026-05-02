import { Collection } from "./collections/collection";
import { RequestModel } from "./requests/request";

export type WorkspaceType = "GeneralInfo" | "Collection";

export const WorkspaceTypes = {
  GeneralInfo: 'GeneralInfo',
  Collection: 'Collection'
} as const;

export type TabItemType = "GeneralInfo" | "Request" | "CollectionSettings";

export const TabItemTypes = {
  Request: 'Request',
  CollectionSettings: 'CollectionSettings',
  GeneralInfo: 'GeneralInfo'
} as const;

export interface Workspace {
  id: string,
  type: WorkspaceType,
  item: Collection | null
}

export interface TabItem {
  id: string,
  tabType: TabItemType,
  name: string | null,
  request: RequestTabItem | null,
  collection: Collection | null
}

export interface RequestTabItem {
  request: RequestModel | null,
  isReplaceable: boolean
}
