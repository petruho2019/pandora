import { CollectionYmlConfig } from './collection-config';

export interface Collection {
  id: string;
  path: string; // ПОЛНЫЙ путь до коллекции ( с названием )
  name: string;
  collectionConfig: CollectionYmlConfig;
}

export const CollectionSettingsTabItems = {
  OVERVIEW: 'Описание',
  HEADERS: 'Заголовки',
  AUTH: 'Аутентификация',
} as const;

export type CollectionSettingsTabItemsType =
  (typeof CollectionSettingsTabItems)[keyof typeof CollectionSettingsTabItems];
