export interface RenameRequestDto {
    requestId: string,
    collectionPath: string,
    oldFileName: string,
    newName: string,
    newFileName: string
}

export interface CloneRequestDto {
    newName: string,
    newFileName: string,
    requestId?: string,
    collectionPath?: string
}

export interface LoadRequestDto {
    collectionPath: string, 
    collectionId: string
}
