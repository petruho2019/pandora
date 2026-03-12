import { RenameDto } from './../shared/models/dto/shared-dtos';
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
import { CloneCollectionDto } from '../shared/models/collections/dto/collection-action-dtos';
import { spawn } from 'child_process';
import { platform } from 'os';

const COLLECTIONS_KEY = 'loadedCollections';

export function initializeCollection(store: ElectronStore<CollectionsStoreSchema>, ipcMain: IpcMain){

    //#region load-collections
    ipcMain.handle('load-collections', async () : Promise<Collection[]> => {

        const collectionsFromStore = store.get(COLLECTIONS_KEY, []);

        console.log(`Collections from store ${JSON.stringify(collectionsFromStore)}`);

        const [validCollections, isCollectionPathsValid] = await validateCollectionPaths(collectionsFromStore);

        if (!isCollectionPathsValid) {
            console.log(`Store updated: ${validCollections.length} collections`);
            store.set(COLLECTIONS_KEY, validCollections);

            //console.log(`Valid collections: ${JSON.stringify(validCollections)}`);

            return validCollections;
        }
        else{
            console.log(`Collections from store are valid: ${JSON.stringify(collectionsFromStore)}`);

            return collectionsFromStore;
        }

    });


    //#region add-collection

    ipcMain.handle('add-collection', async (event, { collectionName, collectionPath }: {collectionName: string, collectionPath: string  }) : Promise<ResultT<Collection, string>> => {
        if (!collectionPath || !collectionName) {
            return buildFailureResultT('Требуются path и collectionName');
        }
        if (!path.isAbsolute(collectionPath)) {
            return buildFailureResultT('Путь должен быть абсолютным');
        }

        const fullCollectionPath = path.join(collectionPath, collectionName);

        fs.stat(fullCollectionPath, ((err, stat) => {
            if (err) {
                if (err.code === 'ENOENT') return;
                return buildFailureResultT('Ошибка при добавлении коллекции');
            }
            if (stat.isDirectory()) return buildFailureResultT('Коллекции уже существует');
        })) 

        const collections = store.get(COLLECTIONS_KEY, []);

        const existsInStore = collections.some(
            item => item.path === fullCollectionPath
        );

        if (existsInStore) {
            return buildFailureResultT('Коллекция уже добавлена');
        }

        try {
            fs.mkdirSync(fullCollectionPath, { recursive: true });
        } catch (err) {
            console.error('Ошибка создания папки', err);
            return buildFailureResultT('Не удалось создать папку коллекции');
        }

        console.log(`Full path to the collection ${fullCollectionPath}`);

        const collectionEntity = {
            path: fullCollectionPath
        };

        var createCollectionConfigFileResult = await createCollectionConfigFile(collectionEntity, collectionName);

        if(createCollectionConfigFileResult.isSuccess){
            const newCollection = mapCollection(collectionEntity, createCollectionConfigFileResult.body);

            collections.push(newCollection);
            store.set(COLLECTIONS_KEY, collections);

            return buildSuccessResultT(newCollection);
        }

        return buildFailureResultT(createCollectionConfigFileResult.error);
    });

    //#region remove-collection

    ipcMain.handle('remove-collection', (event, collectionId: string) : Collection[] => {
        console.log(`Remove collection, collectionId: ${collectionId}`);

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

    ipcMain.handle('open-collection', async (event, collectionPath) : Promise<ResultT<Collection, string>> => {
        if (!collectionPath) {
            return buildFailureResultT('Требуются путь к коллекции');
        }
        if (!path.isAbsolute(collectionPath)) {
            return buildFailureResultT('Путь должен быть абсолютным');
        }
        if (!fs.existsSync(collectionPath)) {
            return buildFailureResultT('Папки не существует');
        }
        
        let collectionConfig: CollectionYmlConfig;
        try{
            
            collectionConfig = yaml.load(await fs.promises.readFile(path.join(collectionPath, COLLECTION_CONFIG_FILE_NAME), 'utf-8')) as CollectionYmlConfig;
            console.log(`Config file found: ${JSON.stringify(collectionConfig)}`);
        }
        catch{
            return buildFailureResultT(COLLECTION_CONFIG_FILE_FORMAT_ERROR) 
        }

        const collections = store.get(COLLECTIONS_KEY, []);
        const existsInStore = collections.some(
            item => item.path === collectionPath
        );

        if (existsInStore) {
            return buildFailureResultT('Коллекция уже добавлена');
        }

        var openedCollectionResult = buildCollection({path: collectionPath});

        if (openedCollectionResult.isFailure){
            return buildFailureResultT(openedCollectionResult.error);
        }

        console.log(`Opened collection: ${openedCollectionResult.body.path}`);

        collections.push(openedCollectionResult.body);
        store.set(COLLECTIONS_KEY, collections);

        return buildSuccessResultT(openedCollectionResult.body);
    });

    //region clone-collection

    ipcMain.handle('clone-collection',  async (event, collectionInfo: CloneCollectionDto): Promise<ResultT<Collection, string>> => {

        const validationResult = validateCloneCollectionDto(collectionInfo);
        if(validationResult.isFailure) return buildFailureResultT(validationResult.errorMessage);

        const collectionsFromStore = store.get(COLLECTIONS_KEY, []);
        const collectionFromStore = collectionsFromStore.find(c => c.id === collectionInfo.sourceCollectionId);

        if(!collectionFromStore)
            return buildFailureResultT(`Коллекция не найдена`);

        const newCollectionPath = path.join(collectionInfo.collectionPath, collectionInfo.folderName);

        console.log(`New collection path: ${newCollectionPath}`);

        try {
            await fs.promises.cp(collectionFromStore.path, newCollectionPath, {recursive: true});
        }
        catch(err){
            return buildFailureResultT(err);
        }

        const configFilePath = path.join(newCollectionPath, COLLECTION_CONFIG_FILE_NAME);

        try {
            fs.unlink(configFilePath, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') return;

                    return buildFailureResultT('Ошибка при удалении старого конфигурационного файла коллекции');
                }
            });
        } catch (err) {
            return buildFailureResultT(err);
        }


        console.log(`File ${configFilePath}`);

        const collectionEntity = {path: newCollectionPath};

        console.log(`NewCollpath: ${newCollectionPath}, ${collectionInfo.collectionName}`);

        var createCollectionConfigFileResult = await createCollectionConfigFile(collectionEntity, collectionInfo.collectionName);

        if(createCollectionConfigFileResult.isSuccess){
            const newCollection = mapCollection(collectionEntity, createCollectionConfigFileResult.body);

            collectionsFromStore.push(newCollection);
            store.set(COLLECTIONS_KEY, collectionsFromStore);

            return buildSuccessResultT(newCollection);
        }

        return buildFailureResultT(`Builder collection ${createCollectionConfigFileResult.error}`);
    });


    //region rename-collection

    ipcMain.handle('rename-collection',  (event, collectionInfo: RenameDto): ResultT<Collection,string> => {

        console.log(`rename-collection: ${JSON.stringify(collectionInfo)}`);

        if(!collectionInfo.name){
            return buildFailureResultT(`Название коллeкции обязательно`);
        }

        const collectionsFromStore = store.get(COLLECTIONS_KEY, []);
        const collectionFromStore = collectionsFromStore.find(c => c.id === collectionInfo.id);

        if(!collectionFromStore) return buildFailureResultT(`Коллекция не найдена`);

        collectionFromStore.name = collectionInfo.name;

        collectionsFromStore.splice(collectionsFromStore.findIndex(c => c.id === collectionInfo.id), 1, collectionFromStore);

        console.log(`\n Collections from store with renamed item: ${collectionsFromStore}`);

        // collectionsFromStore.push(newCollection);
        // store.set(COLLECTIONS_KEY, collectionsFromStore);

        return buildSuccessResultT(collectionFromStore);
    });

    //region open-collection-in-fs
    ipcMain.handle('open-collection-in-fs', async (event, collectionId: string) => {

        console.log(`Trying to open collection in fs: ${collectionId}`);

        const coll = store.get(COLLECTIONS_KEY, []).find(c => c.id === collectionId);

        if(!coll)  return buildFailureResultT("Коллекция не найдена");
        if (!coll.path) return buildFailureResultT("Путь коллекции не найден");

        const platformName = platform().toLowerCase().replace(/[0-9]/g, '').replace('darwin', 'macos');
        
        switch (platformName) {
            case 'win':
                console.log(`before spawn`);
                spawn('explorer.exe', [coll.path], { 
                    stdio: 'ignore', 
                    detached: true 
                });
                console.log(`after spawn`);
                break;
            case 'linux':
                spawn('xdg-open', [coll.path]);
                break;
            case 'macos':
                spawn('open', [coll.path]);
                break;
            default:
                throw new Error("Неподдерживаемая ОС");
        }
        
        return true; 
    });
}

//region functions

function validateCloneCollectionDto(collectionInfo: CloneCollectionDto): Result {
    if(!collectionInfo.collectionName){
        return buildFailureResult(`Название коллeкции обязательно`);
    }

    if(!collectionInfo.folderName){
        return buildFailureResult(`Название папки обязательно`);
    }

    if(!collectionInfo.collectionPath){
        return buildFailureResult(`Путь коллекции обязательно`);
    }

    if(!path.isAbsolute(collectionInfo.collectionPath)){
        return buildFailureResult(`Путь должен быть абсолютным`);
    }

    return buildSuccessResult();
}

function buildCollection(collectionEntity: CollectionEntity): ResultT<Collection, string>{
        const configPath = path.join(collectionEntity.path, COLLECTION_CONFIG_FILE_NAME);

        const collectionConfigResult = getCollectionConfig<CollectionYmlConfig>(configPath);

        if (collectionConfigResult.isFailure) return {body: null, isSuccess: false, isFailure: true, error: collectionConfigResult.error};

        const isValidCollectionConfigResult = validationCollectionYmlConfig(collectionConfigResult.body);

        if(isValidCollectionConfigResult.isFailure) 
            return {body: null, isSuccess: false, isFailure: true, error: isValidCollectionConfigResult.errorMessage};

        return buildSuccessResultT(mapCollection(collectionEntity, collectionConfigResult.body));
}

async function createCollectionConfigFile(collectionInfo: CollectionEntity, collectionName: string): Promise<ResultT<CollectionYmlConfig, string>> { // todo Вынести writeFile в другой метод

    const collectionConfigFile: CollectionYmlConfig =
        createCollectionConfigByCollection(collectionName);

    try {
        await fs.promises.writeFile(
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

async function validateCollectionPaths(collectionsFromStore: Collection[]): Promise<[Collection[], boolean]> {
    const validCollections: Collection[] = [];
    let isCollectionPathsValid = true;

    for (const col of collectionsFromStore) {
        try {
            const stat = await fs.promises.stat(col.path);

            if (!stat.isDirectory()) {
                console.error(`Ошибка при загрузке коллекции ${col.path}`);
                isCollectionPathsValid = false;
                continue;
            }

            validCollections.push(col);
        } catch (err: any) {
            if (err.code === "ENOENT") {
                console.error(`Коллекция ${col.path} не найдена`);
            } else {
                console.error(`Ошибка при проверке коллекции ${col.path}: ${err.message}`);
            }
            isCollectionPathsValid = false;
        }
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