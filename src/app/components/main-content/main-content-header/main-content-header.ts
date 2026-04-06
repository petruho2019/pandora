import { WorkspaceFacadeService } from './../../../../../services/workspace-facade-service';
import { AsyncPipe, NgClass } from '@angular/common';
import { Collection } from './../../../../../shared/models/collections/collection';
import { WorkspaceType, WorkspaceTypes } from './../../../../../shared/models/utils';
import { ActionMenuService } from './../../../../../services/actions-menu-service';
import { WorkspaceInfoService } from '../../../../../services/workspace-info-service';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAll } from '../../../store/selectors/collections.selector';

@Component({
  selector: 'main-content-header',
  imports: [AsyncPipe, NgClass],
  templateUrl: './main-content-header.html',
  styleUrl: './main-content-header.css',
})
export class MainContentHeader {
    private workspaceFacadeService = inject(WorkspaceFacadeService);
    private workspaceInfoService = inject(WorkspaceInfoService);
    
    private actionsMenuService = inject(ActionMenuService);
    private store = inject(Store);

    public selectItemId = '__SELECT_ITEM__';
    public isOpenSelectItemMenu = this.actionsMenuService.openedId$;
    public allCollections$ = this.store.select(selectAll);

    public activeWorkspace = this.workspaceInfoService.activeWorkspace;

    public workspaceTypes = WorkspaceTypes;

    showSelectItem($event: MouseEvent) {
      $event.stopPropagation();

      if(this.actionsMenuService.currentId === this.selectItemId){
        this.actionsMenuService.close();
        return;
      }

      this.actionsMenuService.open(this.selectItemId);
    }

    setWorkspace(type: WorkspaceType, coll: Collection | null){
      if(type === this.workspaceTypes.Collection){
        this.workspaceFacadeService.openCollection(coll!);
      }
      else {
        this.workspaceFacadeService.openGeneralInfo();
      }

      this.actionsMenuService.close();
    }
}
