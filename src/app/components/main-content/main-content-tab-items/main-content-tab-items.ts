import { AfterViewInit, ChangeDetectorRef, Component, computed, DoCheck, ElementRef, HostListener, inject, OnInit, QueryList, signal, TemplateRef, viewChild, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { TabItem, TabItemTypes } from '../../../../../shared/models/utils';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { TabItemService } from '../../../../../services/tab-item-service';
import { WorkspaceInfoService } from '../../../../../services/workspace-info-service';
import { NgClass } from '@angular/common';
import { WorkspaceFacadeService } from '../../../../../services/workspace-facade-service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID } from '../../../../../shared/models/constants';
import { RequestStateService } from '../../../../../services/request-state-service';
import { SaveRequestModal } from "./modals/save-request-modal/save-request-modal";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Store } from '@ngrx/store';
import { selectCollection } from '../../../store/selectors/collections.selector';
import { map } from 'lodash';
import { createHttpRequest } from '../../../store/actions/modal-actions/request-modal.actions';
import { SelectCollectionModal } from "./modals/save-request-modal/modals/select-collection-modal/select-collection-modal";
import { selectRequest } from '../../../store/selectors/requests.selector';
import { Subscription } from 'rxjs';

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
  private store = inject(Store);

  private readonly THRESHOLD = 16;

  @ViewChildren('requestName') requestNames!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('tabsScroll') tabsScroll: ElementRef<HTMLElement>;
  @ViewChild('tabItems') tabItems: ElementRef<HTMLElement>;

  @ViewChild(SaveRequestModal) saveReqModalComponent: SaveRequestModal;

  public showScrollButtons = signal(false);
  public tabsScrollMaxWidth = signal(window.innerWidth - 500);

  savePortal = viewChild.required<TemplateRef<any>>('save');
  saveOverlayRef: OverlayRef;
  saveRequests: TabItem[];

  selectCollectionPortal = viewChild.required<TemplateRef<any>>('selectCollection');
  selectCollectionOverlayRef: OverlayRef;
  selectCollectionModalSubscription: Subscription;
  protected reqToSave: TabItem;

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
    console.log(`closeRequestTabItem`);

    if(tabItem.tabType === TabItemTypes.Request && this.requestStateService.isRequestChanged(tabItem.request!.request!.id)){

      this.showSaveRequest(tabItem);

      return;
    }

    this.closeTabItem(tabItem);

    console.log(`Текущий выбранный таб айте ${JSON.stringify(this.activeTabItem())}`);

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
    this.tabsScrollMaxWidth.set(window.innerWidth - 420);

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

    this.saveOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.savePortal(), this.viewContainerRef);
    this.saveOverlayRef.attach(portal);
  }

  handleShowSelectCollection(tabItem: TabItem){

    if(this.saveRequests?.length !== 1){
      // тут логика когда закрывается само приложение
    }

    this.reqToSave = tabItem; 

    this.selectCollectionOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.selectCollectionPortal(), this.viewContainerRef);
    this.selectCollectionOverlayRef.attach(portal);

    this.selectCollectionModalSubscription = this.selectCollectionOverlayRef.detachments().subscribe(() => {
      this.closeTabItem(this.reqToSave);
    })
  }

  buildOverlayRef(overlay: Overlay) : OverlayRef{
     const overlayRef = overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally(),
        usePopover: false
    })

    overlayRef.backdropClick().subscribe(() => {
      overlayRef?.detach();
    });

    return overlayRef;
  } 

  handleSaveRequest(tabItem: TabItem){
    this.store.select(selectRequest({ id: tabItem.request!.request!.id })).subscribe(r => {

      console.log(`При сохранении запроса из store вернулся запрос: ${JSON.stringify(r, null, 2)}`);

      if(r) {

      }
      else {
        console.log(`Создаем запрос в fs: ${JSON.stringify(tabItem.request!.request!, null, 2)}`);
        this.store.select(selectCollection(tabItem.request!.request!.collectionId!))
        .subscribe(col => {
          this.store.dispatch(createHttpRequest({ actionData: {
            body: {
              collectionId: tabItem.request!.request!.collectionId!,
              method: tabItem.request!.request!.method,
              url: tabItem.request!.request!.url,
              name: tabItem.request!.request!.name,
              collectionPath: col!.path,
              type: 'HTTP'
            },
            modalOverlayRef: this.selectCollectionOverlayRef
          }}))
        });
      }
    })
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
