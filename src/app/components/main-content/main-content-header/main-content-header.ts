import { WorkspaceFacadeService } from './../../../../../services/workspace-facade-service';
import { AsyncPipe, NgClass } from '@angular/common';
import { Collection } from './../../../../../shared/models/collections/collection';
import { WorkspaceType, WorkspaceTypes } from './../../../../../shared/models/utils';
import { ActionMenuService } from './../../../../../services/actions-menu-service';
import { WorkspaceInfoService } from '../../../../../services/workspace-info-service';
import { Component, inject, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAll } from '../../../store/selectors/collections.selector';
import { Overlay } from '@angular/cdk/overlay';

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
    private viewContainerRef = inject(ViewContainerRef);

    public selectItemId = '__SELECT_ITEM__';
    public isOpenSelectItemMenu = this.actionsMenuService.openedId$;
    public allCollections$ = this.store.select(selectAll);

    public activeWorkspace = this.workspaceInfoService.activeWorkspace;

    public workspaceTypes = WorkspaceTypes;

    workspacesPortal = viewChild.required<TemplateRef<any>>('workspaces');

    showSelectWorkspace($event: MouseEvent, trigger: HTMLElement) {
      $event.stopPropagation();

      if(this.actionsMenuService.currentId === this.selectItemId){
        this.actionsMenuService.close();
        return;
      }

      this.actionsMenuService.open(this.selectItemId, trigger, this.workspacesPortal(), this.viewContainerRef, [
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetX: 0,
          offsetY: 6,
        }
      ]);
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
