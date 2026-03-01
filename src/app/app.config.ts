import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { collectionFeatureKey, collectionsReducer } from './store/reducers/collections.reducer';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { CollectionEffects } from './store/effects/collections.effect';
import { ElectronService } from './services/electron-service';
import { RequestEffects } from './store/effects/requests.effect';
import { requestFeatureKey, requestsReducer } from './store/reducers/requests.reducer';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore({
      [collectionFeatureKey]: collectionsReducer,
      [requestFeatureKey]: requestsReducer
    }),
    provideEffects([CollectionEffects, RequestEffects]),
    ElectronService,
    provideAnimationsAsync(),
    provideRouter(routes),
  ]
};

