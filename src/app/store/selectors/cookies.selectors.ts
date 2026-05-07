import { cookieAdapter } from '../adapters/adapters';
import { CookieState } from '../states/states';

export const selectCookiesState = (state: any): CookieState => state.cookies;

export const { selectAll, selectEntities, selectIds, selectTotal } =
  cookieAdapter.getSelectors(selectCookiesState);