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
let dataUrl = await nyaFile.getImageAssetDataUrl("assets/spinner")
// This can be used as the src of a HTML img tag
image.src = dataUrl
```

### Caveats

- Only getImageAssetDataUrl is implemented, for sounds etc. more development needed
- Only certain file types are recognized