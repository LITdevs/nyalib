import JSZip from "jszip";
import nameToMime from "./util/extensionToMime.js";

export default class NyaFile {

    defaultFile;
    nyaFile;
    constructor () {
        if (NyaFile._instance) return NyaFile._instance;
        NyaFile._instance = this;
    }

    /**
     * Load a nyaFile from a URL
     * @param nyaFileUrl
     * @param isDefault
     * @return {Promise<void>}
     */
    async load(nyaFileUrl, isDefault = false) {
        let nyaFileResponse = await fetch(nyaFileUrl);
        let nyaFileBlob = await nyaFileResponse.blob();
        if (isDefault) {
            this.defaultFile = await JSZip.loadAsync(nyaFileBlob);
        } else {
            this.nyaFile = await JSZip.loadAsync(nyaFileBlob)
        }
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
     * @param imagePath
     * @example await getImageAssetDataUrl("/assets/spinner")
     * @return {Promise<string>}
     */
    async getAssetDataUrl(imagePath) {
        let imageFile = await this.getFile(imagePath)
        let imageBase64 = await imageFile.async("base64");
        return `data:${nameToMime(imageFile.name)};base64,${imageBase64}`
    }
}