export interface CloneCollectionDto {
    collectionName: string,
    folderName: string,
    collectionPath: string,
    sourceCollectionId: string
}

export interface RemoveCollectionInfo {
    collectionName: string,
    collectionId: string,
    collectionPath: string
}