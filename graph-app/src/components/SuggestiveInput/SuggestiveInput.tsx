import React, {useEffect} from 'react'
import s from './SuggestiveInput.module.scss'
import {HOST} from "../../../../shared/variables"

interface Props {
    onBlur: (val: string) => void,
    placeholder: string
}

function SuggestiveInput({onBlur, placeholder}: Props) {

    const [list, setList] = React.useState<string[]>([])
    const [value, setValue] = React.useState<string>("")
    const [hasChosen, setHasChosen] = React.useState(false)

    async function getSuggestion() {
        if (value == "")
            return;
        const list = await fetch(`${HOST}/suggest/${value.replaceAll(' ', '_')}`)
            .then(res => res.json()) as string[]

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
