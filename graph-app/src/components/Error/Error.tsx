import React from "react";
import s from "./Error.module.scss";

function Error({errorMessage}: { errorMessage: string }) {
    return (
        <div className={s.error}>
            <div className={s.errorInner}>{errorMessage}</div>
        </div>
    );
}

export default Error;
