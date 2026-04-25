import { Component, EventEmitter, HostListener, inject, Input, Output, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { ModalHeader } from "../../../../reuseable/modals/modal-header/modal-header";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TabItem } from '../../../../../../../shared/models/utils';

@Component({
  selector: 'save-request-modal',
  imports: [ModalHeader],
  templateUrl: './save-request-modal.html',
  styleUrl: './save-request-modal.css',
})
export class SaveRequestModal {

  private overlay = inject(Overlay);

  public headerTitle = 'Не сохраненные изменения';

  @Input() requests: TabItem[];
  @Output() close = new EventEmitter<{ withCloseTabItem: boolean, tabItem: TabItem | null}>();
  @Output() showSelectCollection = new EventEmitter<TabItem>();

  onClose(withCloseTabItem: boolean, tabItem: TabItem | null){
    this.close.emit({ withCloseTabItem: withCloseTabItem, tabItem: tabItem } );
  }

  handleShowSelectCollection() {
    this.showSelectCollection.emit(this.requests[0]!);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.onClose(false, null);
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
