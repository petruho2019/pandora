import { dialog, BrowserWindow, IpcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";
import * as fs from 'fs';
import { CollectionsStoreSchema } from '../shared/store/schemes/collection-store-schema';
import { Collection } from '../shared/models/collections/collection';
import { CollectionEntity }from '../shared/models/entitys/collection-entity';
import { COLLECTION_CONFIG_FILE_NAME, COLLECTION_CONFIG_FILE_FORMAT_ERROR }from '../shared/models/constants';
import { buildFailureResult, buildFailureResultT, buildSuccessResult, buildSuccessResultT, Result, ResultT }from '../shared/models/result';
import { CollectionYmlConfig } from '../shared/models/collections/collection-config'
import ElectronStore = require('electron-store');
import yaml from 'js-yaml';

const COLLECTIONS_KEY = 'loadedCollections';

export function initializeCollection(store: ElectronStore<CollectionsStoreSchema>, ipcMain: IpcMain){

    //#region load-collections
    ipcMain.handle('load-collections', () => {

        const collectionsFromStore = store.get(COLLECTIONS_KEY, []);

        console.log(`Collections from store ${JSON.stringify(collectionsFromStore)}`);

        const [validCollections, isCollectionPathsValid] = validateCollectionPaths(collectionsFromStore);

        if (!isCollectionPathsValid) {
            console.log(`Store updated: ${validCollections.length} collections`);
            store.set(COLLECTIONS_KEY, validCollections);

            console.log(`Valid collections: ${JSON.stringify(validCollections)}`);

            return validCollections;
        }
        else{
            console.log(`Collections from store are valid: ${JSON.stringify(collectionsFromStore)}`);

            return collectionsFromStore;
        }

    });


    //#region add-collection

    ipcMain.handle('add-collection', async (event, { collectionName, collectionPath }: {collectionName: string, collectionPath: string  }) => {
        if (!collectionPath || !collectionName) {
            throw new Error('Требуются path и collectionName');
        }
        if (!path.isAbsolute(collectionPath)) {
            throw new Error('Путь должен быть абсолютным');
        }

        const fullCollectionPath = path.join(collectionPath, collectionName);

        if (fs.existsSync(fullCollectionPath)) {
            throw new Error('Папка коллекции уже существует');
        }

        const collections = store.get(COLLECTIONS_KEY, []);

        const exists = collections.some(
            item => item.path === fullCollectionPath
        );

        if (exists) {
            throw new Error('Коллекция уже добавлена');
        }

        try {
            fs.mkdirSync(fullCollectionPath, { recursive: true });
        } catch (err) {
            console.error('Ошибка создания папки', err);
            throw new Error('Не удалось создать папку коллекции');
        }

        console.log(`Full path to the collection ${fullCollectionPath}`);

        const collectionEntity = {
            path: fullCollectionPath
        };

        var createCollectionConfigFileResult = createCollectionConfigFile(collectionEntity, collectionName);

        if(createCollectionConfigFileResult.isSuccess){
            const newCollection = mapCollection(collectionEntity, createCollectionConfigFileResult.body);

            collections.push(newCollection);
            store.set(COLLECTIONS_KEY, collections);

            return newCollection;
        }

        throw new Error(createCollectionConfigFileResult.error);
    });

    //#region close-collection

    ipcMain.handle('close-collection', (event, collectionId: string) : Collection[] => {
        console.log(`Close collection, collectionId: ${collectionId}`);

        const collections = store.get(COLLECTIONS_KEY, []);
        const filtered = collections.filter(item => item.id !== collectionId);
        store.set(COLLECTIONS_KEY, filtered);

        return filtered;
    });

    //#region select-folder

    ipcMain.handle('select-folder', async () => {
        const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
            properties: ['openDirectory'],
            title: 'Выберите папку с коллекцией'
        });
        return result.canceled ? null : result.filePaths[0];
    });

    //#region open-collection

    ipcMain.handle('open-collection', (event, collectionPath) : CollectionEntity => {
        if (!collectionPath) {
            throw new Error('Требуются путь к коллекции');
        }
        if (!path.isAbsolute(collectionPath)) {
            throw new Error('Путь должен быть абсолютным');
        }
        if (!fs.existsSync(collectionPath)) {
            throw new Error('Папки не существует');
        }
        
        let collectionConfig: CollectionYmlConfig;
        try{
            collectionConfig = yaml.load(fs.readFileSync(path.join(collectionPath, COLLECTION_CONFIG_FILE_NAME), 'utf-8')) as CollectionYmlConfig;
            console.log(`Config file found: ${JSON.stringify(collectionConfig)}`);
        }
        catch{
            throw new Error(COLLECTION_CONFIG_FILE_FORMAT_ERROR) 
        }

        const collections = store.get(COLLECTIONS_KEY, []);
        const exists = collections.some(
            item => item.path === collectionPath
        );

        if (exists) {
            throw new Error('Collection already added');
        }

        var openedCollectionResult = buildCollection({path: collectionPath});

        if (openedCollectionResult.isFailure){
            throw new Error(openedCollectionResult.error);
        }

        console.log(`Opened collection: ${openedCollectionResult.body.path}`);

        collections.push(openedCollectionResult.body);
        store.set(COLLECTIONS_KEY, collections);

        return openedCollectionResult.body;
    });
}

//region functions

function buildCollection(collectionEntity: CollectionEntity): ResultT<Collection, string>{
        const configPath = path.join(collectionEntity.path, COLLECTION_CONFIG_FILE_NAME);

        const collectionConfigResult = getCollectionConfig<CollectionYmlConfig>(configPath);

        if (collectionConfigResult.isFailure) return null;

        const isValidCollectionConfigResult = validationCollectionYmlConfig(collectionConfigResult.body);

        if(isValidCollectionConfigResult.isFailure) {
            return null;
        }

        return buildSuccessResultT(mapCollection(collectionEntity, collectionConfigResult.body));
}

function createCollectionConfigFile(collectionInfo: CollectionEntity, collectionName: string): ResultT<CollectionYmlConfig, string> {

    const collectionConfigFile: CollectionYmlConfig =
        createCollectionConfigByCollection(collectionName);

    try {
        fs.writeFileSync(
            path.join(collectionInfo.path, COLLECTION_CONFIG_FILE_NAME),
            yaml.dump(collectionConfigFile)
        );

        return buildSuccessResultT(collectionConfigFile);
    } catch (err) {
        console.error('Не удалось создать файл конфигурации', err);
        return buildFailureResultT('Error while creating configuration file');
    }
}

function createCollectionConfigByCollection(collectionName: string) : CollectionYmlConfig {
    return {
        collectionInfo: {
            id: uuidv4(),
            name: collectionName
        }
    };
}

function getCollectionConfig<CollectionYmlConfig>(configPath: string): ResultT<CollectionYmlConfig, string> {
    if (fs.existsSync(configPath)) {
        const collectionConfig = yaml.load(
            fs.readFileSync(configPath, 'utf-8')
        ) as CollectionYmlConfig;

        console.log(`Config loaded: ${JSON.stringify(collectionConfig)}`);
        return buildSuccessResultT(collectionConfig);

    }
    return buildFailureResultT(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
}

function validationCollectionYmlConfig(config: CollectionYmlConfig) : Result{
    const info = config.collectionInfo;

    if (!isValidUUID(info.id)) {
        console.log(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
        return buildFailureResult(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
    }

    if (!info.name || info.name.trim().length === 0) {
        console.log(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
        return buildFailureResult(COLLECTION_CONFIG_FILE_FORMAT_ERROR);
    }
    return buildSuccessResult();
}

function validateCollectionPaths(collectionsFromStore: Collection[]): [Collection[], boolean]{
    let validCollections: Collection[] = [];
    let isCollectionPathsValid: boolean = true;
    for(let col of collectionsFromStore) {
        if (!fs.existsSync(col.path)) {
            console.log(`Collection ${col.path} not exist, will delete`);
            isCollectionPathsValid = false;
            continue; 
        }
        validCollections.push(col);
    }

    return [validCollections, isCollectionPathsValid];
} 

function mapCollection(collection: CollectionEntity, collectionConfigYml: CollectionYmlConfig): Collection {
    return {
        id: collectionConfigYml.collectionInfo.id,
        name: collectionConfigYml.collectionInfo.name,
        path: collection.path
    }
}

function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}