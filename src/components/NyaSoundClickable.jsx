import {NyaFile} from "../index.js";
import React, {useEffect, useState} from "react";

/**
 * Wrapper component for buttons that should make a sound
 * @usage ```jsx
 * <NyaSoundClickable asset={"sfx/boom"}>
 *     <button>explosion sound!</button>
 * </NyaSoundClickable>
 * ```
 * @param asset nyafile asset path
 * @param nyaFile NyaFile instance
 * @param children
 * @param volume Sound volume, defaults to 0.25
 * @return {JSX.Element}
 */
export default function NyaSoundClickable({asset, volume, nyaFile, children}) {
    if (!nyaFile) throw new Error(`NyaSoundClickable for ${asset} without nyaFile prop`)
    const obtainNewAudio = () => {
        return new Promise(resolve => {
            nyaFile.getAssetDataUrl(asset, true).then(dataUrl => {
                let audio = new Audio(dataUrl);
                audio.volume = volume || 0.25
                resolve(audio)
            })
        })
    }

    let [sound, setSound] = useState(undefined)

    useEffect(() => {
        setSound(obtainNewAudio())
    }, []);

    const clickHandler = (child) => {
        return async (e) => {
            (await sound).play();
            setSound(obtainNewAudio())
            if (child?.props?.onClick) child.props.onClick(e)
        }
    }

    return <>
        {React.Children.map(children, child => (
            React.cloneElement(child, {onClick: clickHandler(child)})
        ))}
    </>
}