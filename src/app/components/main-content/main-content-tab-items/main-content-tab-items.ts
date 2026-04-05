import { AfterViewInit, ChangeDetectorRef, Component, computed, ElementRef, inject, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TabItem, TabItemTypes } from '../../../../../shared/models/utils';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { TabItemService } from '../../../../../services/tab-item-service';
import { WorkspaceInfoService } from '../../../../../services/workspace-info-service';
import { NgClass } from '@angular/common';
import { WorkspaceFacadeService } from '../../../../../services/workspace-facade-service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'main-content-tab-items',
  imports: [NgClass, CdkDropList, CdkDrag],
  templateUrl: './main-content-tab-items.html',
  styleUrl: './main-content-tab-items.css',
})
export class MainContentTabItems implements AfterViewInit, OnDestroy{
  
    private workspaceInfoService = inject(WorkspaceInfoService);
    private workspaceFacadeService = inject(WorkspaceFacadeService);
    private tabItemService = inject(TabItemService);
    private changeDetector = inject(ChangeDetectorRef);

    @ViewChild('tabsScroll') tabsScroll!: ElementRef<HTMLElement>;
    @ViewChildren('requestName') requestNames!: QueryList<ElementRef<HTMLElement>>;


    ngOnInit(): void {
      if(!this.getTabItemsByWorkspaceId())
        this.tabItemService.setActiveTabItemId('description');
    }  

    activeTabItem = computed(() => {
      const workspaceId = this.workspaceInfoService.activeWorkspaceId();
      const items = this.tabItemService.tabItemsByWorkspaceId();
      const activeId = this.tabItemService.activeTabItemId();

      console.log(`activeTabItem computed , текущий таб айтем ${items[workspaceId]?.find(ti => ti.id === activeId)} , текущий воркспейс ${workspaceId} , текущей таб айтем id: ${activeId}`);

      return items[workspaceId]?.find(ti => ti.id === activeId);
    });
    
    selectTabItem(id: string){
      this.tabItemService.setActiveTabItemId(id);
    }

    private wheelHandler = (event: WheelEvent) => {
      const el = this.tabsScroll?.nativeElement;
      if (!el) return;

      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        el.scrollLeft += event.deltaY;
      }
    };

    ngAfterViewInit(): void {
      this.tabsScroll.nativeElement.addEventListener('wheel', this.wheelHandler, {
        passive: false,
      });

      this.checkRequestNameOverflow();
    }

    ngOnDestroy(): void {
      this.tabsScroll?.nativeElement.removeEventListener('wheel', this.wheelHandler);
    }

    getActiveWorkspace() {
      return this.workspaceInfoService.activeWorkspace();
    }

    getTabItemsByWorkspaceId() {
      return this.tabItemService.tabItemsByWorkspaceId()[this.workspaceInfoService.activeWorkspace()!.id]
    }

    checkRequestNameOverflow() {
      this.requestNames.forEach((ref: any) => {
        this.applyOverflow(ref.nativeElement);
      });

      this.requestNames.changes.subscribe(names => {
        names.forEach((ref: ElementRef<HTMLElement>) => {
          this.applyOverflow(ref.nativeElement);
        });
      });
    }

    closeTabItem(tabItem: TabItem) {
      console.log(`closeRequestTabItem`);
      this.workspaceFacadeService.deleteTabItem(tabItem, this.workspaceInfoService.activeWorkspaceId());

      console.log(`Текущий выбранный таб айте ${JSON.stringify(this.activeTabItem())}`);

      this.changeDetector.detectChanges();
    }

    addReqeuestTabItem() {
      this.tabItemService.addDefaultRequestTabItem(this.workspaceInfoService.activeWorkspace()!.id);
    }

    onHover(event: MouseEvent) {
      const wrapper = event.currentTarget as HTMLElement;
      const name = wrapper.querySelector('.request-name') as HTMLElement;

      if (!name) return;

      this.applyOverflow(name);
    }

    private applyOverflow(element: HTMLElement) {
      requestAnimationFrame(() => {
        if (element.scrollWidth > element.offsetWidth) {
          element.classList.add('text-overflow-mask');
        } else {
          element.classList.remove('text-overflow-mask');
        }
      });
    }

    dropTabItem($event: CdkDragDrop<string[]>){


      console.log(`Информация из ивента, previousIndes: ${$event.previousIndex} , currentIndex: ${$event.currentIndex}`);

      this.tabItemService.moveTabItem($event.previousIndex, $event.currentIndex, this.workspaceInfoService.activeWorkspaceId());
    }

    isHttp(req: RequestModel){
      return req.type === RequestTypes.HTTP;
    }

    isGeneralInfoType(tabItem: TabItem){
      return tabItem.tabType === TabItemTypes.GeneralInfo;
    }

    isCollectionSettingsType(tabItem: TabItem){
      return tabItem.tabType === TabItemTypes.CollectionSettings;
    }

    isRequestType(tabItem: TabItem){
      return tabItem.tabType === TabItemTypes.Request;
    }

}
