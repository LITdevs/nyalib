export default function nameToMime(filename) {
    let fileNameParts = filename.split(".")
    let fileNameExtension = fileNameParts[fileNameParts.length - 1]
    switch (fileNameExtension) {
        // Images
        case "png":
            return "image/png"
        case "svg":
            return "image/svg+xml"
        case "jpg":
        case "jpeg":
            return "image/jpeg"
        case "gif":
            return "image/gif"
        // Audio
        case "mp3":
            return "audio/mpeg"
        case "flac":
            return "audio/flac"
        case "wav":
            return "audio/wav"
        // Data and other
        case "json":
            return "application/json"
        case "otf":
            return "font/opentype"
        case "ttf":
            return "font/ttf"
        default:
            return "application/octet-stream"
    }
}