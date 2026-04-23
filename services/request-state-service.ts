import { Injectable, signal } from "@angular/core";
import { RequestModel } from "../shared/models/requests/request";


@Injectable({ providedIn: 'root'})
export class RequestStateService {
    private requestChanged = signal<Record<string, {req: RequestModel, isChanged: boolean}>>({});

    _requestChanged = this.requestChanged.asReadonly();

    isRequestChanged(reqId: string) {
        return this.requestChanged()[reqId]?.isChanged;
    }

    setRequestChanged(req: RequestModel, changed: boolean){
        this.requestChanged.update(reqs => ({
            ...reqs,
            [req.id]: {req: req, isChanged: changed}
        }));
    }

    setRequestNotChanged(req: RequestModel){
        this.requestChanged.update(reqs => ({
            ...reqs,
            [req.id]: {req: req, isChanged: false}
        }));
    }
}