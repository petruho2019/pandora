import { AfterViewInit, ChangeDetectorRef, Component, computed, DoCheck, ElementRef, HostListener, inject, OnChanges, OnDestroy, OnInit, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { TabItem, TabItemTypes } from '../../../../../shared/models/utils';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { TabItemService } from '../../../../../services/tab-item-service';
import { WorkspaceInfoService } from '../../../../../services/workspace-info-service';
import { NgClass } from '@angular/common';
import { WorkspaceFacadeService } from '../../../../../services/workspace-facade-service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID } from '../../../../../shared/models/constants';

@Component({
  selector: 'main-content-tab-items',
  imports: [NgClass, CdkDropList, CdkDrag],
  templateUrl: './main-content-tab-items.html',
  styleUrl: './main-content-tab-items.css',
})
export class MainContentTabItems implements OnInit, DoCheck, AfterViewInit{


  private workspaceInfoService = inject(WorkspaceInfoService);
    private workspaceFacadeService = inject(WorkspaceFacadeService);
    private tabItemService = inject(TabItemService);
    private changeDetector = inject(ChangeDetectorRef);

    private readonly THRESHOLD = 16;

    @ViewChildren('requestName') requestNames!: QueryList<ElementRef<HTMLElement>>;
    @ViewChild('tabsScroll') tabsScroll: ElementRef<HTMLElement>;// tabItems
    @ViewChild('tabItems') tabItems: ElementRef<HTMLElement>;

    public showScrollButtons = signal(false);
    public tabsScrollMaxWidth = signal(window.innerWidth - 500);

    ngDoCheck(): void {
      this.checkRequestNameOverflow();
    }

    ngOnInit(): void {
      if(!this.getTabItemsByWorkspaceId())
        this.tabItemService.setActiveTabItemId(GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID);
    }  

    ngAfterViewInit(): void {
      this.updateWidth();
    }

    activeTabItem = computed(() => {
      const workspaceId = this.workspaceInfoService.activeWorkspaceId();
      const items = this.tabItemService.tabItemsByWorkspaceId();
      const activeId = this.tabItemService.activeTabItemId();

      return items[workspaceId]?.find(ti => ti.id === activeId);
    });
    
    selectTabItem(id: string){
      this.tabItemService.setActiveTabItemId(id);
      this.changeDetector.detectChanges();
    }

    getActiveWorkspace() {
      return this.workspaceInfoService.activeWorkspace();
    }

    getTabItemsByWorkspaceId() {
      return this.tabItemService.tabItemsByWorkspaceId()[this.workspaceInfoService.activeWorkspace()!.id]
    }

    checkRequestNameOverflow() {
      this.requestNames?.forEach((ref: any) => {
        this.applyOverflow(ref.nativeElement);
      });

      this.requestNames?.changes.subscribe(names => {
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
      this.updateWidth();
    }

    addRequestTabItem() {
      this.tabItemService.addDefaultRequestTabItem(this.workspaceInfoService.activeWorkspace()!.id);
      this.updateWidth();
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

    scrollTabs(delta: number){
      const el = this.tabsScroll?.nativeElement;
      if(!el) return;

      el.scrollBy({
        left: delta,
        behavior: 'smooth'
      });
    }

    updateScrollButtons() {
      const el = this.tabsScroll?.nativeElement;
      if(!el) return;

      this.showScrollButtons.set(
        this.tabsScrollMaxWidth() - el.clientWidth < this.THRESHOLD
      );
    }

    @HostListener('window:resize')
    onResize() {
      this.updateWidth();
      this.checkRequestNameOverflow();
    }

    private updateWidth() {
      this.tabsScrollMaxWidth.set(window.innerWidth - 500);

      requestAnimationFrame(() => {
        this.updateScrollButtons();
      });
    }

}
