import { OverlayRef } from '@angular/cdk/overlay';

export interface ModalActionSuccessResult<T> {
    modalOverlayRef: OverlayRef;
    body: T;
}

export interface ModalActionDataT<T> {
    modalOverlayRef: OverlayRef | null;
    body: T;
}

export interface ModalActionData {
    modalOverlayRef: OverlayRef;
}

