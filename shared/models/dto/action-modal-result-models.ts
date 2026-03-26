import { OverlayRef } from '@angular/cdk/overlay';

export interface ModalActionSuccessResult<T> {
    modalOverlayRef: OverlayRef;
    body: T;
}

export function buildModalActionSuccessResult<T>(modalOverlay: OverlayRef, body: T) : ModalActionSuccessResult<T> {
    return {
        modalOverlayRef: modalOverlay,
        body: body
    }
}

export interface ModalActionDataT<T> {
    modalOverlayRef: OverlayRef;
    body: T;
}

export interface ModalActionData {
    modalOverlayRef: OverlayRef;
}

