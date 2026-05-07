import { Component, inject, Input } from '@angular/core';
import { AlertNotification } from './alert-notification/alert-notification';
import { AlertNotificationService } from '../../../../../services/alert-notification-service';

@Component({
  selector: 'alert-notification-container',
  imports: [AlertNotification],
  templateUrl: './alert-notification-container.html',
  styleUrl: './alert-notification-container.css',
})
export class AlertNotificationContainer {
  private alertNotificationService = inject(AlertNotificationService);

  public alertNotificationMessages =
    this.alertNotificationService.alertNotificationMessages.asReadonly();

  handleMouseEnterOnAlertNotification() {
    this.alertNotificationService.stopQueue();
  }

  handleMouseLeaveOnAlertNotification() {
    this.alertNotificationService.startQueue();
  }
}
