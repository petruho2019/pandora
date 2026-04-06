export interface CloneCollectionDto {
    collectionName: string,
    folderName: string,
    collectionPath: string,
    sourceCollectionId: string
}

export interface CloseCollectionInfo {
    collectionName: string,
    collectionId: string,
    collectionPath: string
}

export interface DeleteCollectionDto {
    collectionName: string,
    collectionId: string,
    collectionPath: string
}