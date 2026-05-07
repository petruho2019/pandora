import { createAction, props } from '@ngrx/store';
import { CookieModel } from '../../../../shared/models/requests/http/http-request-model';

export const loadCookies = createAction('[Cookies] Load');
export const loadCookiesSuccess = createAction(
  '[Cookie] Load Success',
  props<{ cookeis: CookieModel[] }>(),
);
export const loadCookiesFailure = createAction(
  '[Cookie] Add Failure',
  props<{ errorMessage: string }>(),
);
