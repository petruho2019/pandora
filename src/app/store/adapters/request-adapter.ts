import { createEntityAdapter } from "@ngrx/entity";
import { RequestModel } from "../../../../shared/models/requests/request";

export const requestAdapter = createEntityAdapter<RequestModel>({
    selectId: request => request.id
});