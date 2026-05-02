import { WorkspaceInfoService } from '../../services/workspace-info-service';
import { AlertNotificationService } from './../../services/alert-notification-service';
import { RequestStateService } from './../../services/request-state-service';
import { SendRequestService } from './../../services/electron/send-request-service';
import { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { collectionFeatureKey, collectionsReducer } from './store/reducers/collections.reducer';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { CollectionEffects } from './store/effects/collections.effect';
import { CollectionElectronService } from '../../services/electron/collection-electron-service';
import { RequestEffects } from './store/effects/requests.effect';
import { requestFeatureKey, requestsReducer } from './store/reducers/requests.reducer';
import { BlurService } from '../../services/blur-service';
import { RequestElectronService } from '../../services/electron/request-electron-service';
import { CommonEffects } from './store/effects/common.effect';
import { TabItemService } from '../../services/tab-item-service';
import { MonacoEditorModule, provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { ResponseService } from '../../services/response-service';
import * as monaco from 'monaco-editor';
import { provideHttpClient } from '@angular/common/http';

export const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  theme: 'customTheme',

  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: 'off',
  tabCompletion: 'off',
  wordBasedSuggestions: 'off',

  parameterHints: {
    enabled: false
  },

  suggest: {
    showKeywords: false,
    showSnippets: false,
    showFunctions: false,
    showVariables: false,
    showClasses: false,
    showModules: false,
    showProperties: false,
    showOperators: false,
    showUnits: false,
    showValues: false,
    showConstants: false,
    showEnums: false,
    showEnumMembers: false,
    showEvents: false,
    showFields: false,
    showFiles: false,
    showFolders: false,
    showInterfaces: false,
    showIssues: false,
    showMethods: false,
    showStructs: false,
    showUsers: false,
    showColors: false
  }
};

function onMonacoLoad() {
  const options = {
    base: 'vs-dark', 
    inherit: true, 
    colors: {
      "editor.background": '#222222',
      'editorCursor.foreground': '#bbbbbb',
      'editor.lineHighlightBackground': '#222222', 
      'editor.lineHighlightBorder': '#222222', 
      'editor.selectionBackground': '#666666', 
      'editorLineNumber.foreground': '#bbbbbb',
      'editorLineNumber.activeForeground': '#bbbbbb',
      'editorBracketMatch.border': '#222222',
      'editorBracketMatch.background': '#2e2e2e',
      'textPreformat.foreground': '#bbbbbb',
      'editorSuggestWidget.highlightForeground': '#ff0000',
      "editorHoverWidget.background": "#2e2e2e",
      "editorHoverWidget.border": "#444444",
      "editorHoverWidget.foreground": "#cccccc",
      'scrollbar.shadow': '#222222'                    // https://gist.github.com/NeuroNexul/7db6741e8c006159727f26a0fbddf10a
    },
    rules: [
      { token: 'comment', foreground: '7E890B' },
      { token: 'keyword', foreground: 'FF0000' },
      { token: 'string', foreground: 'ff0000' },
      { token: 'number', foreground: '00FFFF' },
      { token: 'identifier', foreground: 'FFFFFF' }           
    ]
  };

  (window as any).monaco.editor.defineTheme('customTheme', options);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideMonacoEditor({
      defaultOptions: {
          theme: 'customTheme',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          ...editorOptions
        },
        onMonacoLoad: onMonacoLoad
    }),
    provideBrowserGlobalErrorListeners(),
    provideStore({
      [collectionFeatureKey]: collectionsReducer,
      [requestFeatureKey]: requestsReducer,
    }),
    provideEffects([CollectionEffects, RequestEffects, CommonEffects]),
    provideHttpClient(),
    CollectionElectronService,
    BlurService,
    RequestElectronService,
    AlertNotificationService,
    WorkspaceInfoService,
    TabItemService,
    MonacoEditorModule,
    SendRequestService,
    RequestStateService,
    ResponseService
  ]
};

