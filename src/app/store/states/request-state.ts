import { EntityState } from '@ngrx/entity';
import { RequestModel } from '../../../../shared/models/requests/request';

export interface RequestState extends EntityState<RequestModel>{
    loadedByCollectionId: Map<string, boolean>;
    error: string | null;
}