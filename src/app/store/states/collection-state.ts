import { EntityState } from '@ngrx/entity';
import { Collection } from '../../../../shared/models/collections/collection';

export interface CollectionState extends EntityState<Collection>{
    loading: boolean;
}