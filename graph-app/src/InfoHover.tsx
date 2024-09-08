import React from "react";

export function infoHover(left: number, top: number, text: string, width: number) {
    return <div style={{ left: left, top: top, position: "absolute", zIndex: 200 }}>
        <div className={"tooltip"}>
            <span className={"tooltiptext"} style={{ width: `${width}px`, marginLeft: `-${(width / 2)}px`}}>{text}</span>
            <img
                className={"info"}
                src={"icons/info.svg"}
                alt="info"
            />
        </div>
    </div>;
}