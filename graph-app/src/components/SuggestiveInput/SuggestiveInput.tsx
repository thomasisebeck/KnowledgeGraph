import React, {useEffect} from 'react'
import s from './SuggestiveInput.module.scss'
import {HOST, ERROR_MESSAGE_TIMEOUT} from "../../../../shared/variables"

interface Props {
    onBlur: (val: string) => void,
    placeholder: string,
    setErrorMessage: (value: string | null) => void
}

function SuggestiveInput({onBlur, placeholder, setErrorMessage}: Props) {

    const [list, setList] = React.useState<string[]>([])
    const [value, setValue] = React.useState<string>("")
    const [hasChosen, setHasChosen] = React.useState(false)

    async function getSuggestion() {
        if (value == "")
            return;
        const list: string[] = await fetch(`${HOST}/suggest/${value.trim().replaceAll(' ', '_')}`)
            .then(res => res.json())
            .catch(e => {
                setErrorMessage("Error: " + e.message)
                setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT);
                setList([])
                return ;
            })

        //remove the underscores
        //not already chosen a value
        setList(list.map(e => e.replaceAll('_', ' ')))
    }

    useEffect(() => {
        getSuggestion();
    }, [value]);

    return (
        <div className={s.container}>
            <input type={"text"}
                   placeholder={placeholder}
                   value={value}
                   onChange={(e) => {
                       setValue(e.target.value)
                       setHasChosen(false)
                   }}
                   onBlur={(e) => {
                       onBlur(e.target.value)
                   }}
            />
            {value != "" && list.length > 0 && !hasChosen &&
                <div className={s.suggestionsList}>
                    {
                        list.map((item, index) => (
                            <div className={s.listItem} key={index} onClick={() => {
                                setHasChosen(true)
                                setValue(item)
                                onBlur(item)
                                setList([])
                            }}>
                                {item}
                            </div>
                        ))
                    }
                </div>
            }
        </div>
    )
}

export default SuggestiveInput;
