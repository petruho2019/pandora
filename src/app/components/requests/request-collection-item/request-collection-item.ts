import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { CollectionEntity } from '../../../../../shared/models/entitys/collection-entity';
import { NgClass } from '@angular/common';
import { BlurService } from '../../../services/blur-service';

@Component({
  selector: 'request-collection-item',
  imports: [NgClass],
  templateUrl: './request-collection-item.html',
  styleUrl: './request-collection-item.css',
})
export class RequestCollectionItem {
  public blurService = inject(BlurService);
  private changeDetectorRef = inject(ChangeDetectorRef)


  @Input() request!: RequestModel;
  @Input() collection!: CollectionEntity;

  isHttp(): boolean{
    return this.request.type === RequestTypes.HTTP;
  }

  onBlurRequest(){
    console.log(`Blur request id: ${this.request.id}`);
    this.blurService.setCurrentBlurId(this.request.id);
  }
}
