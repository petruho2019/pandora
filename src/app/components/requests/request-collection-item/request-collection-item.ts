import { Component, Input } from '@angular/core';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { CollectionEntity } from '../../../../../shared/models/entitys/collection-entity';
import { NgClass } from '@angular/common';

@Component({
  selector: 'request-collection-item',
  imports: [NgClass],
  templateUrl: './request-collection-item.html',
  styleUrl: './request-collection-item.css',
})
export class RequestCollectionItem {
  @Input() request!: RequestModel;
  @Input() collection!: CollectionEntity;

  isHttp(): boolean{
    return this.request.type === RequestTypes.HTTP;
  }
}
