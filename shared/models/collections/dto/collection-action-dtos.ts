export interface CloneCollectionDto {
    collectionName: string,
    folderName: string,
    collectionPath: string,
    sourceCollectionId: string
}

export interface RenameCollectionDto {
    collectionName: string,
    collectioId: string
}