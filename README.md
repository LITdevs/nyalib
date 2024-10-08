# nyalib

This is a library used for handling nyafiles in some Lightquark clients.

### Usage

```js
import NyaFile from "nyalib"

// Create instance of NyaFile
const nyaFile = new NyaFile();

// You can get this instance later
const sameNyaFile = new NyaFile();
// nyaFile and sameNyaFile are the same instance of NyaFile

// If you need a separate instance provide an identifier
const nyaFile2 = new NyaFile("themePreview");

// Load default assets
await nyaFile.load((await fetch("https://lightquark.network/default.nya")).blob(), true) // Replace URL here

// Load a custom nyafile
await nyaFile.load((await fetch("https://lightquark.network/not-default.nya")).blob())

// Get a data url for an image in the nya file
let dataUrl = await nyaFile.getAssetDataUrl("assets/spinner")
// This can be used as the src of a HTML img tag
image.src = dataUrl

// Cache some assets
nyaFile.queueCache("assets/someAsset")
nyaFile.queueCache("assets/someAsset2")
nyaFile.queueCache("assets/someAsset3", "dataUrl") // Default is dataUrl for images, sound etc.
nyaFile.queueCache("assets/someJson", "text") // Alternatively text for text, json etc.
await nyaFile.waitAllCached()

// We can now synchronously get the data url, for example to return an img element directly
return <img src={nyaFile.getCachedData("assets/someAsset")} />

// Loading a new nyafile refreshes the cache
await nyaFile.load((await fetch("https://lightquark.network/not-not-default.nya")).blob())
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

### Help this isn't working!! It says not cached??

Alright, let's check a few things.

1. Make sure you did not include the file extension in the cache call, or the get call
2. Make sure you did not start either path with a /
3. Make sure you call await nyaFile.waitAllCached() BEFORE trying to retrieve a cached asset, if you can't, use await nyaFile.getAsset* methods

If it still doesn't work, you're on your own.

### Help!! I loaded a nyafile and the browser says out of memory?

something too fat

I found that putting 70MB flac audio in the nyafile caused a bunch of issues