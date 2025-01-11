import {unzip} from "fflate";
import mime from "mime";
import path from "path";

const fileExtensionRegex = /(?:\.([^./]+))?$/ // https://stackoverflow.com/a/680982

export default class NyaFile {
    defaultCache = {};
    skinCache = {};

    /**
     * Load a nyafile into this instance.
     * @param {ArrayBuffer|Blob} arrayBuffer - The nyafile's data as an ArrayBuffer, blobs are converted.
     * @param {Boolean} isDefault - Is this nyafile the default? When reading files nyalib checks the skin first, then default, then errors if not found. We assume it's a skin unless you pass true.
     * @returns {Promise<void>}
     */
    async load(arrayBuffer, isDefault = false) {
        if(arrayBuffer instanceof Blob) arrayBuffer = await arrayBuffer.arrayBuffer();
        if(!(arrayBuffer instanceof ArrayBuffer)) throw Error("nyalib: Please pass an ArrayBuffer when loading (or a blob, which will be converted automatically).")
        // I <3 CALLBACKS (major /s it looks ugly)
        return new Promise((resolve, reject) => {
            unzip(new Uint8Array(arrayBuffer), (err, data) => {
                if(err) reject(err);

                const tempCache = {} // I imagine if we suddenly set the real cache to {} react would collapse on itself. This is react babysitting code
                Object.entries(data).forEach(([name, data]) => {
                    if(name.endsWith("/")) return;
                    const blob = new Blob([data], { type: mime.getType(name) });
                    tempCache[name.slice(0, -fileExtensionRegex.exec(name)[0].length)] = {blob, url: URL.createObjectURL(blob)};
                })
                if(isDefault) {
                    this.defaultCache = tempCache
                } else {
                    this.skinCache = tempCache
                }
                resolve();
            });
        })
    }

    getFileURL(fileName) {
        if(this.skinCache[fileName]) return this.skinCache[fileName].url;
        if(this.defaultCache[fileName]) return this.defaultCache[fileName].url;
        throw Error(`nyalib: ${fileName} isn't in the default Nyafile.`);
    }

    async getFileText(fileName) {
        if(this.skinCache[fileName]) return this.skinCache[fileName].blob.text();
        if(this.defaultCache[fileName]) return this.defaultCache[fileName].blob.text();
        throw Error(`nyalib: ${fileName} isn't in the default Nyafile.`);
    }

    async getFileJSON(fileName) {
        return JSON.parse(await this.getFileText(fileName));
    }

    getFileType(fileName) {
        if(this.skinCache[fileName]) return this.skinCache[fileName].blob.type;
        if(this.defaultCache[fileName]) return this.defaultCache[fileName].blob.type;
        throw Error(`nyalib: ${fileName} isn't in the default Nyafile.`);
    }

    listFiles() {
        const list = [
            ...Object.keys(this.defaultCache),
            ...Object.keys(this.skinCache)
        ]
        return list.filter((v,i) => list.indexOf(v) === i).sort();
    }
}
