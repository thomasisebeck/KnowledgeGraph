import React, {useState} from 'react';

import s from './AddButtons.module.scss'
import {HoverImage} from "../HoverImage/HoverImage";

const STATE_MACHINE_NAME = "MyStateMachine"

interface AddButtonsProps {
    showAddBox?: () => void
}

export const AddButtons = ({showAddBox}: AddButtonsProps) => {

    const [expanded, setExpanded] = useState(false)


    const addNode = () => {
        console.log("adding node")
    }

    const addConnection = () => {
        if (showAddBox) {
            console.log("adding connection")
            showAddBox()
        }
    }

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    return (
        <div className={s.buttonContainer}>
            {
                expanded ?
                    <React.Fragment>
                        <HoverImage message={"Create Information Node"} onclick={addNode}
                                    normalImage={"buttons/add node.svg"} hoverImage={"buttons/add node hover.svg"}/>
                        <HoverImage message={"Create Connection"} onclick={addConnection}
                                    normalImage={"buttons/add connection.svg"}
                                    hoverImage={"buttons/add connection hover.svg"}/>
                        <HoverImage message={"Exit"} onclick={toggleExpanded} normalImage={"buttons/exit.svg"}
                                    hoverImage={"buttons/exit hover.svg"}/>
                    </React.Fragment>
                    :
                    <HoverImage message={"Expand"} onclick={toggleExpanded} normalImage={"buttons/plus.svg"}
                                hoverImage={"buttons/plus hover.svg"}/>
            }
        </div>
    )
}