import { createReducer, on } from '@ngrx/store';
import { cookieAdapter } from '../adapters/adapters';
import { CookieState } from '../states/states';
import {
  addCookieModalSuccess,
  deleteCookieModalSuccess,
  deleteDomainModalSuccess,
  modifyCookieModalSuccess,
} from '../actions/modal-actions/cookie-modal.actions';
import { loadCookiesSuccess } from '../actions/cookies.actions';
import { CookieModel } from '../../../../shared/models/requests/http/http-request-model';

export const cookiesFeatureKey = 'cookies';

export const initialState: CookieState = cookieAdapter.getInitialState();

export const TEST_COOKIES: CookieModel[] = [
  // 3 куки для домена .example.com
  {
    id: 'c1f1c1d1-0013-4a11-aaaa-dddddddddddd',
    name: 'session_id',
    value: 'sess_abc123_xyz789',
    path: '/',
    domain: '.example.com',
    expiresAt: '2026-05-14T12:00:00Z',
    secure: true,
    httpOnly: true,
  },
  {
    id: 'c1f1c1d1-0014-4a11-aaaa-eeeeeeeeeeee',
    name: 'user_prefs',
    value: '{"theme":"dark","lang":"ru"}',
    path: '/',
    domain: '.example.com',
    expiresAt: '2027-05-07T12:00:00Z',
    secure: true,
    httpOnly: false,
  },
  {
    id: 'c1f1c1d1-0015-4a11-aaaa-ffffffffff00',
    name: 'auth_token',
    value:
      'jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9ываралдорырваолырвалдоырвалдфрывладрыфдвлардлфыварфылвоародлыва',
    path: '/',
    domain: '.example.com',
    expiresAt: '2026-06-07T12:00:00Z',
    secure: true,
    httpOnly: true,
  },

  // 4 куки на разных доменах
  {
    id: 'c1f1c1d1-0016-4a11-aaaa-101010101010',
    name: 'cart_total',
    value: '5',
    path: '/',
    domain: 'shop.localhost',
    expiresAt: null,
    secure: false,
    httpOnly: false,
  },
  {
    id: 'c1f1c1d1-0017-4a11-aaaa-111111111111',
    name: 'admin_session',
    value: 'admin_xyz456_secure',
    path: '/admin',
    domain: 'admin.app.ru',
    expiresAt: '2026-05-08T12:00:00Z',
    secure: true,
    httpOnly: true,
  },
  {
    id: 'c1f1c1d1-0018-4a11-aaaa-121212121212',
    name: 'tracking_id',
    value: 'ga_user_789',
    path: '/',
    domain: '.google-analytics.com',
    expiresAt: null,
    secure: true,
    httpOnly: false,
  },
  {
    id: 'c1f1c1d1-0019-4a11-aaaa-131313131313',
    name: 'debug_flag',
    value: 'true',
    path: '/',
    domain: 'localhost',
    expiresAt: null,
    secure: false,
    httpOnly: false,
  },

  // 3 куки для домена .app.ru
  {
    id: 'c1f1c1d1-0020-4a11-aaaa-202020202020',
    name: 'refresh_token',
    value: 'refresh_jwt_xyz123',
    path: '/api',
    domain: '.app.ru',
    expiresAt: '2026-12-07T12:00:00Z',
    secure: true,
    httpOnly: true,
  },
  {
    id: 'c1f1c1d1-0021-4a11-aaaa-212121212121',
    name: 'ui_state',
    value: '{"sidebar":true,"notifications":false}',
    path: '/',
    domain: '.app.ru',
    expiresAt: '2027-01-07T12:00:00Z',
    secure: true,
    httpOnly: false,
  },
  {
    id: 'c1f1c1d1-0022-4a11-aaaa-222222222222',
    name: 'lang_select',
    value: 'ru-RU',
    path: '/',
    domain: '.app.ru',
    expiresAt: null,
    secure: false,
    httpOnly: false,
  },
];

export const cookieReducer = createReducer(
  initialState,

  on(loadCookiesSuccess, (state, { cookeis }) => cookieAdapter.addMany(cookeis, state)),
  on(addCookieModalSuccess, (state, { addedCookie }) => cookieAdapter.addOne(addedCookie, state)),
  on(modifyCookieModalSuccess, (state, { modifiedCookie }) =>
    cookieAdapter.updateOne(
      {
        id: modifiedCookie.id,
        changes: modifiedCookie,
      },
      state,
    ),
  ),
  on(deleteCookieModalSuccess, (state, { newCookies }) => {
    console.log(`Новые кукесы: ${JSON.stringify(newCookies)}`);
    return cookieAdapter.setAll(newCookies, state);
  }),
  on(deleteDomainModalSuccess, (state, { newCookies }) => {
    console.log(`Новые кукесы: ${JSON.stringify(newCookies)}`);
    return cookieAdapter.setAll(newCookies, state);
  }),
);
