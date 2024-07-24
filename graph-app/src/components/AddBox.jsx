import s from './addBox.module.scss'


function AddBox ({hideAddBox}) {



    return (
        <div className={s.container} onClick={hideAddBox}>
            <div>
                <select name={"root"}>
                    <option value={"Philosophy"}>Philosophy</option>
                </select>
                <input type={"text"} />
            </div>
        </div>
    )

}

export default AddBox;