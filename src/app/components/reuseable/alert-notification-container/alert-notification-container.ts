import { Component, inject, Input } from '@angular/core';
import { ErrorNotification } from "./alert-notification/alert-notification";
import { AlertNotificationService } from '../../../../../services/alert-notification-service';

@Component({
  selector: 'alert-notification-container',
  imports: [ErrorNotification],
  templateUrl: './alert-notification-container.html',
  styleUrl: './alert-notification-container.css',
})
export class AlertNotificationContainer {

  private alertNotificationService = inject(AlertNotificationService);

  public alertNotificationMessages = this.alertNotificationService.alertNotificationMessages.asReadonly();


  handleMouseEnterOnAlertNotification(){
    console.log(`MouseEnter`);
    this.alertNotificationService.stopQueue();
  }

  handleMouseLeaveOnAlertNotification(){
    console.log(`MouseLeave`);
    this.alertNotificationService.startQueue();
  }
}
