import {HoverImageInterface} from "../../../../shared/interfaces"
import {useState} from "react";
import React from "react";

import s from './HoverImage.module.scss'

export const HoverImage = ({normalImage, hoverImage, onclick, message} : HoverImageInterface) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
            onClick={() => onclick()}
            className={s.div}
        >
            {
                isHovering ?
                    <React.Fragment>
                        <p className={s.text}>{message}</p>
                        <img src={hoverImage} alt={"hoverImage"}/>
                    </React.Fragment> :
                    <img src={normalImage} alt={"normalImage"}/>
            }
        </div>
    )

}