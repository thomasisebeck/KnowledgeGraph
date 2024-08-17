import React, { useEffect, useState } from "react";
import s from "./Error.module.scss";
import { ERROR_MESSAGE_TIMEOUT } from "../../../../shared/variables";

function Error(errorMessage: string) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, ERROR_MESSAGE_TIMEOUT);

        return () => clearTimeout(timer);
    }, [errorMessage]);

    if (!show) return null;

    return (
        <div className={s.error}>
            <div className={s.errorInner}>{errorMessage}</div>
        </div>
    );
}

export default Error;
