import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { SideBarResizeComponent } from "./components/side-bar/side-bar";
import { ActionsMenuService } from '../../services/actions-menu-service';
import { AlertNotificationService } from '../../services/alert-notification-service';
import { AlertNotificationContainer } from "./components/reuseable/alert-notification-container/alert-notification-container";
import { CdkPortal } from "@angular/cdk/portal";

@Component({
  selector: 'app-root',
  imports: [SideBarResizeComponent, AlertNotificationContainer, CdkPortal],
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
    console.log(`Close action menu`);
    this.actionsMenuService.close();
  }

  test() {
    this.alertNotificationService.addAlertNotification(`Error message ${this.i++}`);
  }

}
