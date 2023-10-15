import {useLayoutEffect} from 'react'

/**
 * Loads css from asset path passed in as prop. Use this instead of importing css files to load from nya file
 * @example <StyleProvider nyaFile={new NyaFile()} asset={"assets/testCss"} />
 * @param asset asset path to css file
 * @param nyaFile NyaFile instance
 * @return {JSX.Element}
 * @constructor
 */
export default function StyleProvider({asset, nyaFile}) {
    if (!nyaFile) throw new Error("StyleProvider with no nyaFile provided")
    useLayoutEffect(() => {
        let cssTag = document.querySelector(`style[data-nya-css-asset='${asset}']`);
        if (cssTag) {
            cssTag.remove()
        }

        let styleTag = document.createElement('style');
        styleTag.setAttribute("type", "text/css");
        styleTag.setAttribute("data-nya-css-asset", asset);
        styleTag.appendChild(document.createTextNode(nyaFile.getCachedData(asset)));
        document.head.appendChild(styleTag);
        return () => {
            document.querySelector(`style[data-nya-css-asset='${asset}']`).remove();
        }
    }, [asset]);
    return <></>
}