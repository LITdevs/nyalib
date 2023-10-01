import JSZip from "jszip";
import nameToMime from "./util/extensionToMime.js";

export default class NyaFile {

    defaultFile;
    nyaFile;
    dataUrlCache;
    constructor () {
        if (NyaFile._instance) return NyaFile._instance;
        NyaFile._instance = this;
        this.dataUrlCache = {}
    }

    /**
     * Ask to cache an asset for future use
     * This should ideally be called during initial load AFTER loading a custom nyafile for assets that are going to be used
     * @param filePath
     */
    queueCache(filePath) {
        this.dataUrlCache[filePath] = this.getAssetDataUrl(filePath, true)
    }

    /**
     * Promise that resolves once all queued assets are cached
     * @return {Promise<void>}
     */
    async waitAllCached() {
        await Promise.all(Object.values(this.dataUrlCache))
    }

    /**
     * Performs a full cache refresh
     */
    async explodeCache() {
        console.log(`Full refreshing cache with ${Object.keys(this.dataUrlCache).length} assets`)
        for (const cachedAsset of Object.keys(this.dataUrlCache)) {
            this.queueCache(cachedAsset)
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
        if (!ignoreCache && this.dataUrlCache[filePath]) {
            //console.log(`Returning cached asset for ${filePath}`)
            return this.dataUrlCache[filePath];
        }
        let assetFile = await this.getFile(filePath);
        let assetBase64 = await assetFile.async("base64");
        let dataUrl = `data:${nameToMime(assetFile.name)};base64,${assetBase64}`;
        if (ignoreCache || !this.dataUrlCache[filePath]) this.dataUrlCache[filePath] = dataUrl;
        //console.log(`${filePath} added to cache`)
        return dataUrl
    }

    /**
     * If you are sure an asset is cached you can use this method to get the url synchronously
     * @param filePath
     * @return {string}
     */
    getCachedDataUrl(filePath) {
        if (!this.dataUrlCache[filePath]) throw new Error(`Asset ${filePath} is not cached, but tried to get with getCachedDataUrl()`)
        //console.log(`Returning cached asset for ${filePath}`)
        return this.dataUrlCache[filePath]
    }
}