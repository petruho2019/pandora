import { WorkspaceInfoService } from '../../services/workspace-info-service';
import { AlertNotificationService } from './../../services/alert-notification-service';
import { RequestStateService } from './../../services/request-state-service';
import { SendRequestService } from './../../services/send-request-service';
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
import { CommonEffects } from './store/effects/common.effect';
import { TabItemService } from '../../services/tab-item-service';
import { MonacoEditorModule, provideMonacoEditor } from 'ngx-monaco-editor-v2';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMonacoEditor({
      defaultOptions: {
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
        }
    }),
    provideBrowserGlobalErrorListeners(),
    provideStore({
      [collectionFeatureKey]: collectionsReducer,
      [requestFeatureKey]: requestsReducer,
    }),
    provideEffects([CollectionEffects, RequestEffects, CommonEffects]),
    CollectionElectronService,
    BlurService,
    RequestElectronService,
    AlertNotificationService,
    WorkspaceInfoService,
    TabItemService,
    MonacoEditorModule,
    SendRequestService,
    RequestStateService
  ]
};

