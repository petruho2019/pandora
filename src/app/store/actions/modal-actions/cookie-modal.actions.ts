import { createAction, props } from '@ngrx/store';
import { ModalActionDataT } from '../../../../../shared/models/dto/action-modal-result-models';
import { CookieModel } from '../../../../../shared/models/requests/http/http-request-model';
import {
  DeleteCookieActionDto,
  DeleteDomainActionDto,
} from '../../../components/main-content/item-infos/request-info/request-url/cookies-info/cookies-info';

export const addCookieModal = createAction(
  '[Cookie] Add',
  props<{ actionData: ModalActionDataT<CookieModel> }>(),
);
export const addCookieModalSuccess = createAction(
  '[Cookie] Add Success',
  props<{ addedCookie: CookieModel }>(),
);
export const addCookieModalFailure = createAction(
  '[Cookie] Add Failure',
  props<{ errorMessage: string }>(),
);

export const modifyCookieModal = createAction(
  '[Cookie] Modify',
  props<{ actionData: ModalActionDataT<CookieModel> }>(),
);
export const modifyCookieModalSuccess = createAction(
  '[Cookie] Modify Success',
  props<{ modifiedCookie: CookieModel }>(),
);
export const modifyCookieModalFailure = createAction(
  '[Cookie] Modify Failure',
  props<{ errorMessage: string }>(),
);

export const deleteCookieModal = createAction(
  '[Cookie] Delete cookie',
  props<{ actionData: ModalActionDataT<DeleteCookieActionDto> }>(),
);
export const deleteCookieModalSuccess = createAction(
  '[Cookie] Delete cookie Success',
  props<{ newCookies: CookieModel[] }>(),
);
export const deleteCookieModalFailure = createAction(
  '[Cookie] Delete cookie Failure',
  props<{ errorMessage: string }>(),
);

export const deleteDomainModal = createAction(
  '[Cookie] Delete domain',
  props<{ actionData: ModalActionDataT<DeleteDomainActionDto> }>(),
);
export const deleteDomainModalSuccess = createAction(
  '[Cookie] Delete domain Success',
  props<{ newCookies: CookieModel[] }>(),
);
export const deleteDomainModalFailure = createAction(
  '[Cookie] Delete domain Failure',
  props<{ errorMessage: string }>(),
);
