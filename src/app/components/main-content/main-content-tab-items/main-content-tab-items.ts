import { AfterViewInit, ChangeDetectorRef, Component, computed, DoCheck, effect, ElementRef, EventEmitter, HostListener, inject, input, Input, OnInit, Output, QueryList, signal, TemplateRef, viewChild, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { TabItem, TabItemTypes } from '../../../../../shared/models/utils';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { TabItemService } from '../../../../../services/tab-item-service';
import { WorkspaceInfoService } from '../../../../../services/workspace-info-service';
import { NgClass } from '@angular/common';
import { WorkspaceFacadeService } from '../../../../../services/workspace-facade-service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { DEFAULT_SIDEBAR_WIDTH_PX, GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID, MIN_SIDEBAR_WIDTH_PX } from '../../../../../shared/models/constants';
import { RequestStateService } from '../../../../../services/request-state-service';
import { SaveRequestModal } from "./modals/save-request-modal/save-request-modal";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Store } from '@ngrx/store';
import { SelectCollectionModal } from "./modals/save-request-modal/modals/select-collection-modal/select-collection-modal";
import { Subscription } from 'rxjs';
import { App, buildOverlayRef } from '../../../app'
@Component({
  selector: 'main-content-tab-items',
  imports: [NgClass, CdkDropList, CdkDrag, SaveRequestModal, SelectCollectionModal],
  templateUrl: './main-content-tab-items.html',
  styleUrl: './main-content-tab-items.css',
})
export class MainContentTabItems implements OnInit, DoCheck, AfterViewInit{

  private workspaceInfoService = inject(WorkspaceInfoService);
  private workspaceFacadeService = inject(WorkspaceFacadeService);
  private tabItemService = inject(TabItemService);
  private changeDetector = inject(ChangeDetectorRef);
  private requestStateService = inject(RequestStateService);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);

  private readonly THRESHOLD = 16;

  @ViewChildren('requestName') requestNames!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('tabsScroll') tabsScroll: ElementRef<HTMLElement>;
  @ViewChild('tabItems') tabItems: ElementRef<HTMLElement>;

  @ViewChild(SaveRequestModal) saveReqModalComponent: SaveRequestModal;

  @Output() saveReq = new EventEmitter<TabItem>();
  @Output() saveReqAlreadyInStore = new EventEmitter<TabItem>();

  public sidebarWidth = input<number>(400);

  public showScrollButtons = signal(false);
  public tabsScrollMaxWidth = signal(window.innerWidth - 300);

  savePortal = viewChild.required<TemplateRef<any>>('save');
  saveOverlayRef: OverlayRef;
  saveRequests: TabItem[];

  selectCollectionPortal = viewChild.required<TemplateRef<any>>('selectCollection');
  selectCollectionOverlayRef: OverlayRef;
  selectCollectionModalSubscription: Subscription;
  protected reqToSave: TabItem;

  constructor() {
    effect(() => {
      this.sidebarWidth();
      this.updateWidth();
    })    
  }

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

  closeTabItemWithCondition(tabItem: TabItem) {
    if(tabItem.tabType === TabItemTypes.Request && this.requestStateService.isRequestChanged(tabItem.request!.request!.id)){

      this.showSaveRequest(tabItem);

      return;
    }
    this.closeTabItem(tabItem);

    this.changeDetector.detectChanges();
    this.updateWidth();
  }


  addRequestTabItem() {
    this.tabItemService.addDefaultRequestTabItem(this.workspaceInfoService.activeWorkspace()!);
    this.updateWidth();
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
    this.tabsScrollMaxWidth.set(window.innerWidth - (this.sidebarWidth() === undefined ? DEFAULT_SIDEBAR_WIDTH_PX : this.sidebarWidth()) - 115);

    requestAnimationFrame(() => {
      this.updateScrollButtons();
    });
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

  private closeTabItem(tabItem: TabItem) {
    this.workspaceFacadeService.deleteTabItem(tabItem, this.workspaceInfoService.activeWorkspaceId());
  }

  showSaveRequest(tabItem: TabItem) {
    this.saveRequests = [tabItem];

    this.saveOverlayRef = buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.savePortal(), this.viewContainerRef);
    this.saveOverlayRef.attach(portal);
  }

  handleShowSelectCollection(tabItem: TabItem){

    if(this.saveRequests?.length !== 1){
      // тут логика когда закрывается само приложение
    }

    this.reqToSave = tabItem; 

    this.selectCollectionOverlayRef = buildOverlayRef(this.overlay, "250px");
    const portal = new TemplatePortal(this.selectCollectionPortal(), this.viewContainerRef);
    this.selectCollectionOverlayRef.attach(portal);

    this.selectCollectionModalSubscription = this.selectCollectionOverlayRef.detachments().subscribe(() => {
      this.closeTabItem(this.reqToSave);
    })
  }

  handleSaveRequest(tabItem: TabItem){
    this.saveReq.emit(tabItem);
  }

  handleSaveRequestAlreadyInStore(tabItem: TabItem) {
    this.saveReqAlreadyInStore.emit(tabItem);
  }

  closeSaveRequestModal(withCloseTabItem: boolean, tabItem: TabItem | null) {
    this.saveOverlayRef.detach()

    if(withCloseTabItem) {
      this.closeTabItem(tabItem!);
    }
  }

  handleCloseSelectCollection(){
    this.selectCollectionModalSubscription.unsubscribe();
    this.selectCollectionOverlayRef.detach();
  }
}
