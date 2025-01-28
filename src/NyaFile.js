import {unzip} from "fflate";
import mime from "mime";
import path from "path";

// https://stackoverflow.com/a/680982
const fileExtensionRegex = /(?:\.([^./]+))?$/

// I'm so good at these names, it's a file in the NyaFile...
class NyaFileFile {
    /**
     * @param {String} name
     * @param {Uint8Array} data
     */
    constructor(name, data) {
        this.blob = new Blob([data], { type: mime.getType(name) })
        this.url = URL.createObjectURL(this.blob)
    }
}

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
                    tempCache[name.slice(0, -fileExtensionRegex.exec(name)[0].length)] = new NyaFileFile(name, data);
                })

                let URLsToKill;
                if(isDefault) {
                    URLsToKill = Object.values(this.defaultCache).map(file => file.url);
                    this.defaultCache = tempCache
                } else {
                    URLsToKill = Object.values(this.skinCache).map(file => file.url);
                    this.skinCache = tempCache
                }
                URLsToKill.forEach(url => URL.revokeObjectURL(url))
                resolve();
            });
        })
    }

    /**
     * This will get the file from skinCache first and defaultCache otherwise. Neither? Puke!
     * You can get basically everything you want from this through friendlier functions.
     * @private
     * @param fileName
     * @returns {NyaFileFile}
     */
    getInternalFile(fileName) {
        if(this.skinCache[fileName]) return this.skinCache[fileName];
        if(this.defaultCache[fileName]) return this.defaultCache[fileName];
        throw Error(`nyalib: ${fileName} isn't in the default Nyafile.`);
    }

    getFileBlob(fileName) {
        return this.getInternalFile(fileName).blob;
    }

    /** @returns {Promise<ArrayBuffer>} */
    async getFileBuffer(fileName) {
        return this.getInternalFile(fileName).blob.arrayBuffer()
    }

    getFileURL(fileName) {
        return this.getInternalFile(fileName).url;
    }

    /** @returns {Promise<String>} */
    async getFileText(fileName) {
        return this.getInternalFile(fileName).blob.text();
    }

    async getFileJSON(fileName) {
        return JSON.parse(await this.getFileText(fileName));
    }

    getFileType(fileName) {
        return this.getInternalFile(fileName).blob.type;
    }

    listFiles() {
        const list = [
            ...Object.keys(this.defaultCache),
            ...Object.keys(this.skinCache)
        ]
        return list.filter((v,i) => list.indexOf(v) === i).sort();
    }
}
