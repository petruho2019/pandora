import { TableRow } from '../../../shared/models/requests/request';
import { AuthKind } from '../requests/http/auth';
import { AuthItem } from '../requests/http/http-request-model';

export interface CollectionYmlConfig {
  collectionInfo: CollectionConfig;
  collectionSettings: CollectionSettings;
}

export interface CollectionConfig {
  id: string;
  name: string;
}

export interface CollectionSettings {
  headers: TableRow[];
  auth: Record<string, AuthItem>;
}
