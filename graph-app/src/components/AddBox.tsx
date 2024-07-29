import React from 'react';
import s from './addBox.module.scss'

function AddBox ({hideAddBox} : { hideAddBox: () => void }) {

    return (
        <div className={s.container}>
            <div className={s.box}>
                <div>
                    <label>Name the connection:</label>
                    <input type={"text"}/>
                </div>
                <div>
                    <label>Double sided:</label>
                    <input type={"checkbox"}/>
                </div>
                <button>Create</button>
            </div>
            <div className={s.background} onClick={hideAddBox}></div>
        </div>
    )

}

export default AddBox;