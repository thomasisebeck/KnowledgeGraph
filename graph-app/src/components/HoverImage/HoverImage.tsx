import {HoverImageInterface} from "../../../../shared/interfaces";
import React, {useState} from "react";

import s from "./HoverImage.module.scss";

export const HoverImage = ({
    normalImage,
    hoverImage,
    onclick,
    message,
    customPadding
}: HoverImageInterface) => {
    const [isHovering, setIsHovering] = useState(false);

    const style = customPadding ? { right: customPadding } : {}

    return (
        <div
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
            onClick={() => onclick()}
            className={s.div}
        >
            {
                <React.Fragment>
                    {isHovering && <p style={style} className={s.text}>{message}</p>}
                    <img
                        src={isHovering ? hoverImage : normalImage}
                        alt={message}

                    />
                </React.Fragment>
            }
        </div>
    );
};
