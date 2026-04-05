import { Workspace, WorkspaceTypes } from '../shared/models/utils';
import { Collection } from '../shared/models/collections/collection';
import { computed, Injectable, signal } from '@angular/core';
import { GENERAL_INFORMATION_WORKSPACE_ID } from '../shared/models/constants';


@Injectable({ providedIn: 'root' })
export class WorkspaceInfoService {

  private _workspaces = signal<Workspace[]>([
    { id: GENERAL_INFORMATION_WORKSPACE_ID, type: WorkspaceTypes.GeneralInfo, item: null }
  ]);

  public workspaces = this._workspaces.asReadonly();

  private _activeWorkspaceId = signal(GENERAL_INFORMATION_WORKSPACE_ID);

  public activeWorkspaceId = this._activeWorkspaceId.asReadonly();

  public activeWorkspace = computed(() =>
    this._workspaces().find(ws => ws.id === this._activeWorkspaceId())
  );

  setActiveWorkspaceId(id: string) {
    this._activeWorkspaceId.set(id);
  }

  ensureCollectionWorkspace(coll: Collection): string {
    const existing = this._workspaces().find(ws => ws.item?.id === coll.id);

    if (existing) {
      return existing.id;
    }

    const newWorkspace: Workspace = {
      id: coll.id,
      type: WorkspaceTypes.Collection,
      item: coll
    };

    this._workspaces.update(ws => [...ws, newWorkspace]);
    return newWorkspace.id;
  }
}