import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { AlertNotificationContainer } from '../src/app/components/reuseable/alert-notification-container/alert-notification-container';
import { v4 as uuidv4 } from 'uuid';

type AlertMessage = {
    id: string;
    text: string;
}


@Injectable({ providedIn: 'root'})
export class AlertNotificationService {

    private overlay = inject(Overlay);
    private overlayRef?: OverlayRef;

    public alertNotificationMessages = signal<AlertMessage[]>([]);

    private intervalId: number | null = null;

    renderAlertNotificationContainer() {
        if (this.overlayRef) return;

        this.overlayRef = this.overlay.create({
            positionStrategy: this.overlay.position()
                .global(),
            hasBackdrop: false,
            panelClass: 'cdk-overlay-notification-container',
            backdropClass: 'cdk-overlay-notification-container-backdrop'
        });

        const portal = new ComponentPortal(AlertNotificationContainer);
        this.overlayRef.attach(portal);
    }

    addAlertNotification(message: string){
        this.alertNotificationMessages.set([{ id: uuidv4(), text: message }, ...this.alertNotificationMessages()]);
        //this.startQueue();
    }

    startQueue(){
        // if(this.intervalId !== null) return;

        // this.intervalId = window.setInterval(() => {
        //     const messages = this.alertNotificationMessages();
        //     if(messages.length === 0) {
        //         this.stopQueue();
        //         return;
        //     };

        //     this.removeFirstAlertNotificationMessage();

        //     if(messages.length === 0) {
        //         this.stopQueue();
        //         return;
        //     };
        // }, 1000)
    }

    stopQueue() {
        if(this.intervalId !== null){
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    removeFirstAlertNotificationMessage() {
        this.alertNotificationMessages.update(messages => messages.slice(0, -1));
    }
}