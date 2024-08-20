import React, {useEffect} from 'react'
import s from './SuggestiveInput.module.scss'
import {HOST} from "../../../../shared/variables"

function SuggestiveInput(list: string[], onClick: () => void, onBlur: () => void, placeholder: string): React.ReactNode {
    const getSuggestionList = async () => {
        const list = await fetch(`${HOST}/suggest`)
            .then(res => res.json())
        console.log("LIST")
        console.log(list)
    }

    useEffect(() => {
        getSuggestionList()
    }, []);

    return (
        <div className={s.container}>
            <input type={"text"} onClick={onClick} onBlur={onBlur} placeholder={placeholder} />
            <div className={s.suggestionsList}>
                {
                    list.map((item, index) => (
                        <div className={s.listItem} key={index}>
                            {item}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default SuggestiveInput;
