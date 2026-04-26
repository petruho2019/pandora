import { OverlayRef } from "@angular/cdk/overlay";
import { createAction, props } from "@ngrx/store";


export const closeModal = createAction('[Modal] Success', props<{ modalOverlay: OverlayRef | null }>());
