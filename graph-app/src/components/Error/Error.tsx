import React, {useEffect, useState} from "react";
import s from "../AddStackDialogue/AddStackDialogue.module.scss";

function Error(errorMessage: string) {
    const [show, setShow] = useState(true);

    const ERROR_MESSAGE_TIMEOUT = 4000;

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, ERROR_MESSAGE_TIMEOUT);

        return () => clearTimeout(timer);
    }, [errorMessage]);

    if (!show) return null;

    return (
        <div className={s.error}>
            <div className={s.errorInner}>
                {errorMessage}
            </div>
        </div>
    );
}

export default Error;