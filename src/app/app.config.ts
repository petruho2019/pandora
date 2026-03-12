import { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { collectionFeatureKey, collectionsReducer } from './store/reducers/collections.reducer';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { CollectionEffects } from './store/effects/collections.effect';
import { CollectionElectronService } from '../../services/collection-electron-service';
import { RequestEffects } from './store/effects/requests.effect';
import { requestFeatureKey, requestsReducer } from './store/reducers/requests.reducer';
import { BlurService } from '../../services/blur-service';
import { RequestElectronService } from '../../services/request-electron-service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore({
      [collectionFeatureKey]: collectionsReducer,
      [requestFeatureKey]: requestsReducer
    }),
    provideEffects([CollectionEffects, RequestEffects]),
    CollectionElectronService,
    BlurService,
    RequestElectronService
  ]
};

