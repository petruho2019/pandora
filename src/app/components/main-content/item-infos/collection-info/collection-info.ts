import { Component, EventEmitter, inject, input, Input, model, Output } from '@angular/core';
import {
  Collection,
  CollectionSettingsTabItems,
  CollectionSettingsTabItemsType,
} from '../../../../../../shared/models/collections/collection';
import { Store } from '@ngrx/store';
import { selectTotal } from '../../../../store/selectors/requests.selectors';
import { AsyncPipe, NgClass } from '@angular/common';
import { CollHeaders } from './coll-headers/coll-headers';
import { TableRow } from '../../../../../../shared/models/requests/request';
import { TabItemService } from '../../../../../../services/tab-item-service';
import {
  updateCollectionAuth,
  updateCollectionHeaders,
} from '../../../../store/actions/collections.actions';
import { AuthItem } from '../../../../../../shared/models/requests/http/http-request-model';
import { CollAuth } from './coll-auth/coll-auth';

@Component({
  selector: 'collection-info',
  imports: [AsyncPipe, NgClass, CollHeaders, CollAuth],
  templateUrl: './collection-info.html',
  styleUrl: './collection-info.css',
})
export class CollectionInfo {
  private store = inject(Store);
  private tabItemService = inject(TabItemService);

  public coll = model.required<Collection>();
  selectedTabItem = model<Record<string, CollectionSettingsTabItemsType>>();
  selectedAuthItem = model.required<AuthItem>();
  collHeaders = model<Record<string, TableRow[]>>();
  collectionAuthInfos = model.required<Record<string, AuthItem>>();
  collectionAuthDraftInfos = model<Record<string, AuthItem>>();
  selectedCollectionAuthItemDraft = model<AuthItem>();

  public requestQuantity = this.store.select(selectTotal);

  @Output() onSelectedCollectionSettingTabItemChanged = new EventEmitter<{
    tabType: CollectionSettingsTabItemsType;
    collId: string;
  }>();

  @Output() onSelectedAuthItemChanged = new EventEmitter<AuthItem>();
  @Output() onSelectedAuthChanged = new EventEmitter<AuthItem>();
  @Output() onSaveAuth = new EventEmitter<{ auth: AuthItem; collId: string }>();

  public tabItems = Object.values(CollectionSettingsTabItems);
  public collectionSettingsTabItems = CollectionSettingsTabItems;

  handleSelectCollectionTabItem(item: CollectionSettingsTabItemsType) {
    this.selectedTabItem.update((items) => ({
      ...items,
      [this.coll()!.id]: item,
    }));

    this.onSelectedCollectionSettingTabItemChanged.emit({
      tabType: item,
      collId: this.coll()!.id,
    });
  }

  isOverview() {
    return this.selectedTabItem()![this.coll()!.id]! === CollectionSettingsTabItems.OVERVIEW;
  }

  isHeaders() {
    return this.selectedTabItem()![this.coll()!.id]! === CollectionSettingsTabItems.HEADERS;
  }

  isAuth() {
    return this.selectedTabItem()![this.coll()!.id]! === CollectionSettingsTabItems.AUTH;
  }

  handleHeadersChanged(headers: TableRow[]) {
    this.coll()!.collectionConfig.collectionSettings.headers = headers;

    this.tabItemService.updateCollection(this.coll()!.id, {
      collectionConfig: {
        collectionInfo: this.coll()!.collectionConfig.collectionInfo,
        collectionSettings: {
          ...this.coll()!.collectionConfig.collectionSettings,
          headers,
        },
      },
    });

    this.store.dispatch(
      updateCollectionHeaders({ updateDto: { collId: this.coll()!.id, headers: headers } }),
    );
  }

  handleSaveAuth(auth: AuthItem) {
    this.coll()!.collectionConfig.collectionSettings.auth[auth.kind] = auth;

    this.tabItemService.updateCollection(this.coll()!.id, {
      collectionConfig: {
        collectionInfo: this.coll()!.collectionConfig.collectionInfo,
        collectionSettings: {
          ...this.coll()!.collectionConfig.collectionSettings,
          auth: {
            ...this.coll()!.collectionConfig.collectionSettings.auth,
            [auth.kind]: auth,
          },
        },
      },
    });

    this.store.dispatch(
      updateCollectionAuth({ updateDto: { collId: this.coll()!.id, auth: auth } }),
    );

    this.onSaveAuth.emit({ auth, collId: this.coll()!.id });
  }

  handleAuthItemChanged(auth: AuthItem) {
    this.onSelectedAuthItemChanged.emit(auth);
  }

  handleAuthChanged(auth: AuthItem) {
    this.onSelectedAuthChanged.emit(auth);
  }
}
