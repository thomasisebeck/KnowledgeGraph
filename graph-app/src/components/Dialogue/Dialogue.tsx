import React, {ReactNode} from "react";
import s from "./dialoggue.module.scss";

//generic popup dialogue with styling
function Dialogue({children, hideDialogue, title}: { children: ReactNode, hideDialogue: () => void, title: string }) {
    return (
        <div className={s.container}>
            <div className={s.box}>
                <div>
                    <h3>{title}</h3>
                </div>
                {children}
                <button onClick={hideDialogue}>Cancel</button>
            </div>
            <div className={s.background} onClick={hideDialogue}></div>
        </div>
    )
}

export default Dialogue;