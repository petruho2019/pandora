import { computed, Injectable } from '@angular/core';
import { RequestModel } from '../shared/models/requests/request';
import { BODY_KIND } from '../shared/models/constants';


@Injectable({ providedIn: 'root' })
export class RequestChangeDetectorService {

    public requestFieldChanged: Record<string, { sourceReq: RequestModel, changes: Record<string, boolean> } > = {};

    initRequestFieldChanged(req: RequestModel) {
        this.requestFieldChanged[req.id] = {
            sourceReq: this.cloneRequest(req),
            changes: {}
        };

        for (const key of Object.keys(req) as (keyof RequestModel)[]) {
            this.requestFieldChanged[req.id].changes[String(key)] = false;
        }
    }

    private cloneRequest(req: RequestModel): RequestModel {
        return {
            ...req,
            body: req.body ? { ...req.body } : { none: { kind: BODY_KIND.NONE, name: 'Без тела', group: 'Other' } },
            headers: req.headers ? req.headers.map(h => ({ ...h })) : [],
            params: req.params ? req.params.map(p => ({ ...p })) : [],
        };
        }

    toProxy(obj: any): any {
        console.log(`ToProxy: ${JSON.stringify(obj, null ,2)}`);
        if (typeof obj !== 'object' || obj === null) return obj;

        for (const key in obj) {
            obj[key] = this.toProxy(obj[key]);
        }

        return new Proxy(obj, {
            set: (target, prop: string, value) => {
                target[prop] = this.toProxy(value);
                return true;
            }
        });
    }
   
}