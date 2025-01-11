# nyalib

This is a library used for handling nyafiles in some Lightquark clients.

## Upgrade to nyalib v3
nyalib v3 is faster, smaller, and easier to use for most usecases. Can you believe that!

JSZip has been replaced with [fflate](<https://github.com/101arrowz/fflate>), providing multithreaded loading and making the caching system obsolete. In addition, nyalib now gives blob URLs instead of data URLs. This is to solve memory issues caused by repeatedly loading data URLs into the DOM, and to make it more feasible to use nyafile URLs in CSS.

* load now takes ArrayBuffers because fflate takes ArrayBuffers. Lol. Blobs will be converted automatically.
* getAssetDataUrl is replaced by getFileURL, a synchronous function that gives blob URLs instead.
* getAssetText is called getFileText, it is still asynchronous and behaves the same.
* getAssetJSON is called getFileJSON, it is still asynchronous and behaves the same.
* getCachedData for URLs is obsolete and has been removed.


* getFileType will give you the MIME type of the blob. The MIME type is assumed based on what the extension was.


* getCachedData for text has no equivalent in v3 because I didn't wanna do it.
* getCachedJson was removed for the same reason.

## Usage

```js
import NyaFile from "nyalib"

// Create instance of NyaFile
const nyafile = new NyaFile();

// Load default assets
await nyafile.load((await fetch("https://lightquark.network/default.nya")).arrayBuffer(), true) // Replace URL here

// Load a custom nyafile
await nyafile.load((await fetch("https://lightquark.network/not-default.nya")).arrayBuffer())

// Get a blob url for an image in the nya file
return <img src={nyafile.getFileURL("assets/spinner")} />

// Loading a new nyafile refreshes the cache
await nyafile.load((await fetch("https://lightquark.network/not-not-default.nya")).arrayBuffer())
return <img src={nyafile.getFileURL("assets/spinner")} />
// Returns different value than before

// Get the contents of a text file
let newJson = await nyafile.getFileText("assets/hakaselore")
// Or 
let newText = await nyafile.getAssetText("assets/someText")
```
