import { Collection } from './../../shared/models/collections/collection';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { SideBarResizeComponent } from "./components/side-bar/side-bar";
import { ActionsMenuService } from '../../services/actions-menu-service';
import { AlertNotificationService } from '../../services/alert-notification-service';
import { AlertNotificationContainer } from "./components/reuseable/alert-notification-container/alert-notification-container";
import { CdkPortal } from "@angular/cdk/portal";
import { MainContent } from "./components/main-content/main-content";

@Component({
  selector: 'app-root',
  imports: [SideBarResizeComponent, AlertNotificationContainer, CdkPortal, MainContent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  
  private actionsMenuService = inject(ActionsMenuService);
  private alertNotificationService = inject(AlertNotificationService);

  private i: number = 0;

  ngOnInit(): void {
    this.alertNotificationService.renderAlertNotificationContainer();
  }

  protected readonly title = signal('pandora');

  @HostListener('document:click')
  closeActions() {
    this.actionsMenuService.close();
  }

  test() {
    this.alertNotificationService.addAlertNotification(`
    Коллекция с таким именем уже существует по пути
    D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests`);
  }

}
