import { Component, EventEmitter, HostListener, inject, Input, Output, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { ModalHeader } from "../../../../reuseable/modals/modal-header/modal-header";
import { RequestModel } from '../../../../../../../shared/models/requests/request';
import { SelectCollectionModal } from "./modals/select-collection-modal/select-collection-modal";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TabItem } from '../../../../../../../shared/models/utils';

@Component({
  selector: 'save-request-modal',
  imports: [ModalHeader, SelectCollectionModal],
  templateUrl: './save-request-modal.html',
  styleUrl: './save-request-modal.css',
})
export class SaveRequestModal {

    private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);

  public headerTitle = 'Не сохраненные изменения';

  @Input() requests: TabItem[];
  @Output() close = new EventEmitter<{ withCloseTabItem: boolean, tabItem: TabItem | null}>();
  @Output() save = new EventEmitter<RequestModel>();

  selectCollectionPortal = viewChild.required<TemplateRef<any>>('selectCollection');
  selectCollectionOverlayRef: OverlayRef;
  reqToSave: RequestModel;

  showSelectCollection(){

    if(this.requests.length !== 1){
      // тут логика когда закрывается само приложение
    }

    this.reqToSave = this.requests[0].request!.request!; 

    this.selectCollectionOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.selectCollectionPortal(), this.viewContainerRef);
    this.selectCollectionOverlayRef.attach(portal);
  }

  onClose(withCloseTabItem: boolean, tabItem: TabItem | null){
    this.close.emit({ withCloseTabItem: withCloseTabItem, tabItem: tabItem } );
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.onClose(false, null);
  }

  handleSaveRequest(req: RequestModel) {
    this.save.emit(req);
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

  

}
