import React from 'react';
import s from './addBox.module.scss'
import ReactDOM from "react-dom";
import {createRelRequestBody} from "../interfaces";

function AddBox({hideAddBox, createConnection}: { hideAddBox: () => void, createConnection: (name: string, doubleSided: boolean) => void }) {

    const nameRef = React.useRef<HTMLInputElement | null>(null);
    const checkRef = React.useRef<HTMLInputElement | null>(null);
    const [message, setMessage] = React.useState('');

    const tryCreateConnection = () => {
        if (nameRef.current != null && checkRef.current != null) {

            console.log("adding connection")

            if (nameRef.current.value != "") {
                const name = nameRef.current.value;
                const isDoubleSided = checkRef.current.checked;
                createConnection(name, isDoubleSided);

                return ;
            }

            setMessage("name is not set")
        }
    }

    return (
        <div className={s.container}>
            <div className={s.box}>
                <div>
                    <h3>Create Connection</h3>
                </div>
                <div>
                    <label>Name the connection:</label>
                    <input type={"text"} ref={nameRef}/>
                </div>
                <div>
                    <label>Double sided:</label>
                    <input type={"checkbox"} ref={checkRef}/>
                </div>
                <button onClick={tryCreateConnection}>Create</button>
                <button onClick={hideAddBox}>Cancel</button>
            </div>
            <div className={s.background} onClick={hideAddBox}></div>
        </div>
    )

}

export default AddBox;