# nyalib

This is a library used for handling nyafiles in some Lightquark clients.

### Usage

```js
import NyaFile from "nyalib"

// Create instance of NyaFile (there can only be one)
const nyaFile = new NyaFile();

// Load default assets
await nyaFile.load("https://lightquark.network/default.nya", true) // Replace URL here

// Load a custom nyafile
await nyaFile.load("https://lightquark.network/not-default.nya")

// Get a data url for an image in the nya file
let dataUrl = await nyaFile.getAssetDataUrl("assets/spinner")
// This can be used as the src of a HTML img tag
image.src = dataUrl

// Cache some assets
nyaFile.queueCache("assets/someAsset")
nyaFile.queueCache("assets/someAsset2")
nyaFile.queueCache("assets/someAsset3")
nyaFile.queueCache("assets/someJson")
await nyaFile.waitAllCached()

// We can now synchronously get the data url, for example to return an img element directly
return <img src={nyaFile.getCachedData("assets/someAsset")} />

// Loading a new nyafile refreshes the cache
await nyaFile.load("https://lightquark.network/not-not-default.nya")
return <img src={nyaFile.getCachedData("assets/someAsset")} />
// Returns different value than before

// Get some parsed JSON that was cached earlier
let json = nyaFile.getCachedJson("assets/someJson")
// Or load one that was not cached
let newJson = await nyaFile.getAssetJson("assets/someOtherJson")
// Or a text file
let newText = await nyaFile.getAssetText("assets/someText")
// This got cached in the previous operation so it can be retrieved
// Notice we are using getCachedData for text
let alreadyCachedText = nyaFile.getCachedData("assets/someText")
```