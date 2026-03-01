export interface Result{
    errorMessage: string | null;
    isSuccess: boolean;
    isFailure: boolean;
}

export interface ResultT<TBody, TError>{
    body: TBody | null;
    error: TError | null;
    isSuccess: boolean;
    isFailure: boolean;
}

export function buildFailureResult(errorMessage:string) : Result {
    return {
        errorMessage: errorMessage,
        isSuccess: false,
        isFailure: true
    }
}

export function buildSuccessResult() : Result {
    return {
        errorMessage: null,
        isSuccess: true,
        isFailure: false
    }
}

export function buildFailureResultT<TBody, TError>(error:TError) : ResultT<TBody, TError> {
    return {
        body: null,
        error: error,
        isSuccess: false,
        isFailure: true
    }
}

export function buildSuccessResultT<TBody, TError>(body: TBody) : ResultT<TBody, TError> {
    return {
        body: body,
        error: null,
        isSuccess: true,
        isFailure: false
    }
}

