import { Collection } from './../shared/models/collections/collection';
import { Injectable, signal } from "@angular/core";
import { RequestTabItem, TabItem, TabItemTypes, Workspace, WorkspaceTypes } from '../shared/models/utils';
import { v4 as uuidv4 } from 'uuid';
import { RequestModel, RequestTypes } from '../shared/models/requests/request';
import { buildDefaultAuth, buildDefaultBody, HttpMethods } from "../shared/models/requests/http/http-request-model";
import { GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID, REQUEST_TAB_ITEM_DEFAULT_NAME } from "../shared/models/constants";
import { moveItemInArray } from "@angular/cdk/drag-drop";

@Injectable({ providedIn: 'root' })
export class TabItemService {
  private _tabItemsByWorkspaceId = signal<Record<string, TabItem[]>>( 
    {
        'general': 
        [
            {
                id: GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID,
                name: "Описание",
                tabType: TabItemTypes.GeneralInfo,
                request: null,
                collection: null
            }
        ]
    });

  private _activeTabItemId = signal<string>('description');

  public activeTabItemId = this._activeTabItemId.asReadonly();
  public tabItemsByWorkspaceId = this._tabItemsByWorkspaceId.asReadonly();

  public getActiveTabItem(workspaceId: string) : TabItem | undefined {
    return this._tabItemsByWorkspaceId()[workspaceId]?.find(ti => ti.id === this._activeTabItemId())
  };

  setActiveTabItemId(id: string) {
    this._activeTabItemId.set(id);
  }

  ensureCollectionSettingsTabItem(coll: Collection, workspaceId: string): string {
    const existing = this._tabItemsByWorkspaceId()[workspaceId]?.find(
      ti => ti.tabType === TabItemTypes.CollectionSettings && ti.collection?.id === coll.id
    );

    if (existing) {
      return existing.id;
    }

    const newTab: TabItem = {
      id: uuidv4(),
      name: 'Коллекция',
      tabType: TabItemTypes.CollectionSettings,
      request: null,
      collection: coll
    };

    this._tabItemsByWorkspaceId.update(items => ({
        ...items,
        [workspaceId]: [...(items[workspaceId] ?? []), newTab]
    }));
    return newTab.id;
  }

  addRequestTabItem(req: RequestModel, coll: Collection){

    this._tabItemsByWorkspaceId.update(items => {
        const requestTabItem = items[coll.id].find(ti => ti.collection?.id === coll.id && ti.request?.request?.id === req.id);

        if(requestTabItem){
            this.setActiveTabItemId(requestTabItem.id);
            return {...items};
        }

        const newRequestTabItem: TabItem = {
            id: uuidv4(),
            name: req.name,
            request: { request: req, isReplaceable: true },
            collection: coll,
            tabType: TabItemTypes.Request
        };

        const lastReplaceableRequest = items[coll.id].find(ti => ti.request?.isReplaceable);

        this.setActiveTabItemId(newRequestTabItem.id); // Можно вынести, но пока не мешает 

        return { ...items, [coll.id]: [...(items[coll.id] ?? []).filter(req => req.id !== lastReplaceableRequest?.id), newRequestTabItem] };
    })
  }

  setRequestTabItemNotReplaceable(req: RequestModel, coll: Collection){
    this._tabItemsByWorkspaceId.update(items => {
        items[coll.id].find(ti => ti.collection?.id === coll.id && ti.request?.request?.id === req.id)!.request!.isReplaceable = false;

        return items;
    });
  }

  deleteTabItem(tabItemToDelete: TabItem, workspaceId: string) : string | null {

    let newActiveId: string | null = '';

    this._tabItemsByWorkspaceId.update(items => {
      const list = items[workspaceId];

      const index = list.findIndex(t => t.id === tabItemToDelete.id);
      const updated = list.filter(t => t.id !== tabItemToDelete.id);

      newActiveId = this._activeTabItemId();

      if (tabItemToDelete.id === newActiveId) {
        if (updated.length) {
          if (index > 0) {
            newActiveId = updated[index - 1].id;
          } else {
            newActiveId = updated[0].id;
          }
        } else {
          newActiveId = null; // Добавить смену воркспейса когда в текущем воркспейсе нет айтемов 
        }
      }

      return { ...items, [workspaceId]: updated };
    });

    return newActiveId;
  }

  addDefaultRequestTabItem(workspace: Workspace) {
    const requestName = this.buildDefaultName(workspace.id);

    const tabItem: TabItem = {
      id: uuidv4(),
      tabType: TabItemTypes.Request,
      name: requestName,
      request: this.buildDefaultRequestModel(requestName),
      collection: null
    } 

    if(workspace.type === WorkspaceTypes.Collection){
      tabItem.collection = workspace.item;
      tabItem.request!.request!.collectionId = workspace.id;
    }

    this._tabItemsByWorkspaceId.update(items => {
      items[workspace.id].push(tabItem);
      return items;
    })
  }

  moveTabItem(fromIndex: number, toIndex: number, workspaceId: string){
    let tabItems = this._tabItemsByWorkspaceId()[workspaceId]
    moveItemInArray(tabItems, fromIndex, toIndex);
    this._tabItemsByWorkspaceId.update(items => {
      return { ...items, [workspaceId]: tabItems}
    });
  }

  buildDefaultRequestModel(name: string): RequestTabItem{
    return {
      request: {
        id: uuidv4(),
        method: HttpMethods.GET,
        headers: [],
        body: buildDefaultBody(),
        auth: buildDefaultAuth(), 
        name: name,
        params: [],
        url: '',
        type: RequestTypes.HTTP,
        collectionId: null, 
        fileName: REQUEST_TAB_ITEM_DEFAULT_NAME
      },
      isReplaceable: false
    }
  }

  buildDefaultName(workspaceId: string) : string {
    const requestTabItems = this.tabItemsByWorkspaceId()[workspaceId];

    let requestNumber: number = 1;
    let name: string = REQUEST_TAB_ITEM_DEFAULT_NAME;

    while(true) {
      if(!requestTabItems.find(rti => rti.name === `${name} ${String(requestNumber)}`)){
        break;
      };
      requestNumber++;
    }

    return `${name} ${String(requestNumber)}`;
  }

  updateRequest(reqId: string, patch: Partial<RequestModel>) {
    this._tabItemsByWorkspaceId.update(state => {
      const newState: Record<string, TabItem[]> = {};

      for (const workspaceId in state) {
        newState[workspaceId] = state[workspaceId].map(tab => {

          if (!tab.request?.request) return tab;

          if (tab.request!.request!.id !== reqId) return tab;

          return {
            ...tab,
            request: {
              ...tab.request,
              request: {
                ...tab.request.request,
                ...patch
              }
            }
          };
        });
      }

      return newState;
    });
  }
}