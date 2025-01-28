# nyalib

This is a library used for handling Nyafiles in Quarky.

## Usage

### Blob URLs: they work great most of the time

nyalib v3 is very easy to use if you just want [blob URLs](https://www.w3.org/TR/FileAPI/#url). Just create a `NyaFile` and use `load(buffer, default)` with an ArrayBuffer of your Nyafile, then pass an asset's name **without the file extension** to `getFileURL(name)`. There's your blob URL, use it wherever you throw your media.

Okay that was a lot of nonsense words, just look at these three and a half lines of code instead:

```js
import NyaFile from "nyalib";
const nyafile = new NyaFile();
await nyafile.load((await fetch("https://quarky.nineplus.sh/quarky.nya")).arrayBuffer(), true);

<img src={nyafile.getFileURL("img/hakase_pfp")} />
```

Notice that we are passing a boolean, `default` to `load()`. This indicates that the Nyafile we are loading will be our *default* Nyafile. You can omit that for it to be a *skin* Nyafile. Assets are loaded in the order of skin -> default -> error.

If you use `load()` again while already having a default/skin Nyafile, the cache will get overwritten with the new one and any old blob URLs will be released.

### Alternative Formats: when you're too bratty to eat blobs

Of course, you can read your assets in other ways as well. Like `getFileURL` you just pass the file name, BUT unlike it these will all be asynchronous.

`getFileText`, `getFileJSON`, `getFileBuffer`, and `getFileBlob` are all different ways to read your assets. The first and last are self-explanatory enough I hope. `getFileJSON` is `getFileText` but it does `JSON.parse()` for you, and getFileBuffer is thefile as an ArrayBuffer.

It's important to note that since nyalib v3 was revamped to have blob URLs as the main focus, these alternative formats are a bit neglected at the moment. **There is no caching for alternative formats.** I am sorry.