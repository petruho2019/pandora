import { Collection } from './../../shared/models/collections/collection';
import { Component, EventEmitter, HostListener, inject, OnInit, Output, signal, ViewChild } from '@angular/core';
import { SideBarComponent } from "./components/side-bar/side-bar";
import { ActionMenuService } from '../../services/actions-menu-service';
import { AlertNotificationService } from '../../services/alert-notification-service';
import { AlertNotificationContainer } from "./components/reuseable/alert-notification-container/alert-notification-container";
import { CdkPortal } from "@angular/cdk/portal";
import { MainContent } from "./components/main-content/main-content";
import { RenameDto } from '../../shared/models/dto/shared-dtos';
import { CloseCollectionInfo } from '../../shared/models/collections/dto/collection-action-dtos';

@Component({
  selector: 'app-root',
  imports: [SideBarComponent, AlertNotificationContainer, CdkPortal, MainContent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private actionMenuService = inject(ActionMenuService);
  private alertNotificationService = inject(AlertNotificationService);

  @ViewChild(SideBarComponent) sideBarComponent: SideBarComponent;

  ngOnInit(): void {
    this.alertNotificationService.renderAlertNotificationContainer();
  }

  protected readonly title = signal('pandora');

  @Output() addCollection = new EventEmitter();
  @Output() openCollection = new EventEmitter();
  @Output() renameCollection = new EventEmitter();
  @Output() openInFSCollection = new EventEmitter();
  @Output() closeCollection = new EventEmitter();

  handleRenameCollection(collInfo: RenameDto) {
    this.sideBarComponent.renameCollection(collInfo);
  }

  handleOpenInFS(collId: string) {
    this.sideBarComponent.openCollectionInFS(collId);
  }
  
  handleCloseCollection(collInfo: CloseCollectionInfo) {
    this.sideBarComponent.closeCollection(collInfo);
  }
  handleAddCollection() {
    this.sideBarComponent.showAddCollectionModal();
  }

  handleOpenCollection() {
    this.sideBarComponent.openCollection();
  }

  @HostListener('click')
  closeActions() {
    console.log(`closeActions`);
    this.actionMenuService.close();
  }

  test() {
    this.alertNotificationService.addAlertNotification(`
    Коллекция с таким именем уже существует по пути
    D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests`);
  }

}
