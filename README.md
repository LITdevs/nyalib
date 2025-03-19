# nyalib

This is a library used for handling Nyafiles, ZIP files distinguished with the .nya extension, in Quarky and other web apps. 

The intent is for most of your aesthetical files to be contained in a Nyafile. Since they are, and you pull them out of nyalib, a secondary Nyafile can be loaded, providing no-effort [skinning](https://en.wikipedia.org/wiki/Theme_(computing)) for those files.

## Security reminder...
nyalib is a simplistic library that handles the main logistics of loading and reading from a Nyafile and layering one more on top. nyalib cannot guarantee the integrity of any Nyafile it loads, and is not expected to. You should only use nyalib, and in turn Nyafiles, for aesthetical customization functionality.

Also, keep in mind that you are most likely using this in a web browser. Web browsers are big and can have bugs. [Nasty](https://nvd.nist.gov/vuln/detail/cve-2023-4863) bugs. **Your users are at risk of malicious Nyafiles!** It is a good idea to have a skin sharing platform, so that you can review Nyafiles in advance and decline or take down Nyafiles you discover to be malicious. It also finding skins more convenient for your users.

## Usage

### Loading a Nyafile

```js
import NyaFile from "nyalib";
const nyafile = new NyaFile();
await nyafile.load((await fetch("https://quarky.nineplus.sh/quarky.nya")).arrayBuffer(), true);
```

Here we use nyalib to load an external Nyafile. It takes ArrayBuffers or Blobs, so we are converting the fetch accordingly before passing it.

Notice that we are passing a truthy value to `load()` after the buffer. This indicates that the Nyafile we are loading will be our *default* Nyafile. You can omit that for it to be a *skin* Nyafile. If a file is present in the skin, the skin's copy is prioritized over the default in all getters.

If you use `load()` again while already having a default/skin Nyafile, the respective cache will get overwritten with the new one and any old blob URLs will be released. As a result, you can only have one default and (optionally) one skin Nyafile loaded at a time.

### Blob URLs

nyalib v3 is very easy to use if you just want [blob URLs](https://www.w3.org/TR/FileAPI/#url). With the NyaFile instance you created, pass an asset's name **without the file extension** to `getFileURL(name)`. There's your blob URL, use it wherever you throw your media.

Why no file extension? Let's say your original asset was a jpg and the skin has a png instead. This wouldn't work normally. Therefore file extensions are ignored in nyalib. You can use `getFileType` to see what the MIME type was, but keep in mind this is just based on the extension.

```js
<img src={nyafile.getFileURL("img/hakase_pfp")} />
```

### Alternative formats

Of course, you can read your assets in other ways as well. Like `getFileURL` you just pass the asset name, BUT unlike it these will all be asynchronous, excluding `getFileBlob`.

* `getFileText` is the asset's raw text content. 
* `getFileJSON` is `getFileText` but it does `JSON.parse()` for you.
* `getFileBuffer` is the asset as an ArrayBuffer.
* `getFileBlob` is the asset's blob, in case you need to do some interesting thing with it...

It's important to note that since nyalib v3 was revamped to have blob URLs as the main focus, these alternative formats are a bit neglected at the moment. **There is no caching for alternative formats.** I am sorry.

### Bonus features
You can use `listFiles` to get an array of all loaded asset names. This lets you check if a file exists before doing anything with it, as nyalib throws an error if the file is not in either Nyafile.
