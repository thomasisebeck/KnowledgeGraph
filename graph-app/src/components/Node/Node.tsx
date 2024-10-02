import React from "react";
import s from "./Node.module.scss";

interface NodeProps {
    children: React.ReactNode;
}

function Node({ children }: NodeProps) {
    return (
        <div className={s.nodeDivOuter}>
            <div className={s.nodeDiv}></div>
            <div className={s.content}>
                {/*for the input element, or text*/}
                {children}
            </div>
        </div>
    );
}

export default Node;
