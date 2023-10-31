import * as JSZip from "jszip"
import nameToMime from "./util/extensionToMime.js";

export default class NyaFile {

    defaultFile;
    nyaFile;
    /**
     * Cache entries are objects with 2 fields
     * - kind -> which kind of asset is this? dataUrl for images/audio/video etc. text for text/json etc.
     * - data -> relevant data or promise for getting it
     */
    assetCache;

    /**
     * Create an instance of the NyaFile class
     * Use identifier to have several NyaFiles loaded
     * @param identifier
     * @return {NyaFile}
     */
    constructor (identifier = "default") {
        if (NyaFile[`_instance_${identifier}`]) return NyaFile[`_instance_${identifier}`];
        NyaFile[`_instance_${identifier}`] = this;
        this.assetCache = {}
    }

    /**
     * Ask to cache an asset for future use
     * This should ideally be called during initial load AFTER loading a custom nyafile for assets that are going to be used
     * @param filePath
     * @param kind What kind of asset this is (dataUrl, text)
     */
    queueCache(filePath, kind = "dataUrl") {
        let getDataMethod;
        switch (kind) {
            case "dataUrl":
                getDataMethod = this.getAssetDataUrl.bind(this);
                break;
            case "text":
                getDataMethod = this.getAssetText.bind(this);
                break;
        }
        this.assetCache[filePath] = {kind: kind, data: getDataMethod(filePath, true)}
    }

    /**
     * Returns list of asset paths
     * Limitation: This does not cope with the variants in subfolder structure, instead of [folder] you will get [folder/1.png, folder/2.png], sorry :3
     * @return {string[]}
     */
    listFiles() {
        let files = this.nyaFile.file(/.+/).map(file => file.name);
        let defaultFiles = this.defaultFile.file(/.+/).map(file => file.name);
        let mergedArray = [...files, ...defaultFiles];
        return mergedArray.filter((v, i) => mergedArray.indexOf(v) === i);
    }

    /**
     * Promise that resolves once all queued assets are cached
     * @return {Promise<void>}
     */
    async waitAllCached() {
        await Promise.all(Object.values(this.assetCache).map(v => v.data))
    }

    /**
     * Performs a full cache refresh
     */
    async explodeCache() {
        console.log(`Full refreshing cache with ${Object.keys(this.assetCache).length} assets`)
        for (const cachedAsset of Object.keys(this.assetCache)) {
            this.queueCache(cachedAsset, this.assetCache[cachedAsset].kind)
        }
        //console.log("All entries re-queued")
        await this.waitAllCached()
        //console.log("Full cache refresh complete!")
        return true
    }

    /**
     * Load a nyaFile from a URL
     * @param nyaFileUrl
     * @param isDefault
     * @return {Promise<boolean>}
     */
    async load(nyaFileUrl, isDefault = false) {
        let nyaFileResponse = await fetch(nyaFileUrl);
        let nyaFileBlob = await nyaFileResponse.blob();
        if (isDefault) {
            this.defaultFile = await JSZip.loadAsync(nyaFileBlob);
        } else {
            this.nyaFile = await JSZip.loadAsync(nyaFileBlob)
        }
        return await this.explodeCache()
    }

    /**
     * Get jszip file object from custom nyafile if present, fallback to default
     * If multiple options available pick randomly
     * @param filePath
     * @return {Promise<*>}
     */
    async getFile(filePath) {
        let fileNameRegex = new RegExp(`${filePath}((\\..+)|(\\/.+\\..+))`);
        if (!this.nyaFile) return await this.getDefaultFile(filePath)
        let searchResults = this.nyaFile.file(fileNameRegex)
        if (searchResults.length === 0) return this.getDefaultFile(filePath)
        return searchResults[Math.floor(Math.random()*searchResults.length)];
    }

    /**
     * Get jszip file object from default nyafile
     * If multiple options available pick randomly
     * @param filePath
     * @return {Promise<*>}
     */
    async getDefaultFile(filePath) {
        let fileNameRegex = new RegExp(`${filePath}((\\..+)|(\\/.+\\..+))`);
        let files = this.defaultFile.file(fileNameRegex);
        if (files.length === 0) throw new Error(`Asset ${filePath} not found in default nyafile`);
        return files[Math.floor(Math.random()*files.length)]
    }

    /**
     * Get a data url for an asset in the nya file
     * This example will find all of the following files
     * ```
     * /assets/spinner/1.png
     * /assets/spinner/2.svg
     * /assets/spinner/3.gif
     * /assets/spinner.png
     * ```
     *
     * When there are multiple options one is picked at random
     * @example await getImageAssetDataUrl("/assets/spinner")
     * @param filePath
     * @param ignoreCache
     * @return {Promise<string>}
     */
    async getAssetDataUrl(filePath, ignoreCache = false) {
        if (!ignoreCache && this.assetCache[filePath]) {
            //console.log(`Returning cached asset for ${filePath}`)
            return await this.assetCache[filePath].data;
        }
        let assetFile = await this.getFile(filePath);
        let assetBase64 = await assetFile.async("base64");
        let dataUrl = `data:${nameToMime(assetFile.name)};base64,${assetBase64}`;
        if (ignoreCache || !this.assetCache[filePath]) this.assetCache[filePath] = {kind: "dataUrl", data: dataUrl};
        //console.log(`${filePath} added to cache`)
        return dataUrl
    }

    /**
     * getAssetDataUrl for text based files
     * @param filePath
     * @param ignoreCache
     * @return {Promise<*>}
     */
    async getAssetText(filePath, ignoreCache = false) {
        if (!ignoreCache && this.assetCache[filePath]) {
            //console.log(`Returning cached asset for ${filePath}`)
            return await this.assetCache[filePath].data;
        }
        let assetFile = await this.getFile(filePath);
        let assetText = await assetFile.async("text");
        if (ignoreCache || !this.assetCache[filePath]) this.assetCache[filePath] = {kind: "text", data: assetText};
        //console.log(`${filePath} added to cache`)
        return assetText;
    }

    /**
     * getAssetDataUrl for JSON
     * @param filePath
     * @param ignoreCache
     * @return {Promise<*>}
     */
    async getAssetJson(filePath, ignoreCache = false) {
        return JSON.parse(await this.getAssetText(filePath, ignoreCache));
    }

    /**
     * If you are sure an asset is cached you can use this method to get the url synchronously
     * If the asset is not cached you will have a bad time
     * Use this method for cached data urls or text
     * @param filePath
     * @return {string}
     */
    getCachedData(filePath) {
        if (!this.assetCache[filePath]) throw new Error(`getCachedData Tried to retrieve asset ${filePath} from cache but not cached`)
        return this.assetCache[filePath].data;
    }

    /**
     * If you are sure an asset is cached you can use this method to get the url synchronously
     * If the asset is not cached you will have a bad time
     * Use this method for cached JSON
     * @param filePath
     * @return {any}
     */
    getCachedJson(filePath) {
        if (!this.assetCache[filePath]) throw new Error(`getCachedJson Tried to retrieve asset ${filePath} from cache but not cached`)
        // console.log(filePath)
        // console.log(this.assetCache[filePath])
        return JSON.parse(this.assetCache[filePath].data);
    }
}