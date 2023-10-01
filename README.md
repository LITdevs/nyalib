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
await nyaFile.waitAllCached()

// We can now synchronously get the data url, for example to return an img element directly
return <img src={nyaFile.getCachedDataUrl("assets/someAsset")} />

// Loading a new nyafile refreshes the cache
await nyaFile.load("https://lightquark.network/not-not-default.nya")
return <img src={nyaFile.getCachedDataUrl("assets/someAsset")} />
// Returns different value than before
```

### Caveats

- Only getAssetDataUrl is implemented. More development needed for things like the \<NyaAsset> React component
- Only certain file types are recognized