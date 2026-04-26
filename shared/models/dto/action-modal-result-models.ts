import { OverlayRef } from '@angular/cdk/overlay';

export interface ModalActionSuccessResult<T> {
    modalOverlayRef: OverlayRef;
    body: T;
}

export interface ModalActionDataT<T> {
    modalOverlayRefs: OverlayRef[] | null;
    body: T;
    successMessage?: string;
}

export interface ModalActionData {
    modalOverlayRef: OverlayRef;
}

