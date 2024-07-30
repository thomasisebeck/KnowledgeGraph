import React, {useEffect, useState} from 'react';

import s from './AddButtons.module.scss'
import {HoverImage} from "../HoverImage/HoverImage";

const STATE_MACHINE_NAME = "MyStateMachine"

interface AddButtonsProps {
    showAddBox?: () => void
}

enum IMAGES {
    ADD_CONNECTION,
    ADD_NODE,
    DOWNVOTE,
    EXIT,
    PLUS
}

const images = [
    {
        normal: "buttons/add-connection.svg",
        hover: "buttons/add-connection-hover.svg",
        message: "connect two nodes"
    },
    {
        normal: "buttons/add-node.svg",
        hover: "buttons/add-node-hover.svg",
        message: "create node with information"
    },
    {
        normal: "buttons/downvote.svg",
        hover: "buttons/downvote-hover.svg",
        message: "downvote connection"
    },
    {
        normal: "buttons/exit.svg",
        hover: "buttons/exit-hover.svg",
        message: "exit"
    },
    {
        normal: "buttons/plus.svg",
        hover: "buttons/plus-hover.svg",
        message: "menu"
    },
]

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

    //preload images
    useEffect(() => {
        for (const img of images) {
            const image = new Image();
            image.src = img.normal;
            image.src = img.hover;
        }
    }, []);

    return (
        <div className={s.buttonContainer}>
            {
                expanded ?
                    <React.Fragment>
                        <HoverImage
                            message={images[IMAGES.ADD_NODE].message}
                            onclick={addNode}
                            normalImage={images[IMAGES.ADD_NODE].normal}
                            hoverImage={images[IMAGES.ADD_NODE].hover}
                        />
                        <HoverImage
                            message={images[IMAGES.ADD_CONNECTION].message}
                            onclick={addConnection}
                            normalImage={images[IMAGES.ADD_CONNECTION].normal}
                            hoverImage={images[IMAGES.ADD_CONNECTION].hover}
                        />
                        <HoverImage
                            message={images[IMAGES.EXIT].message}
                            onclick={toggleExpanded}
                            normalImage={images[IMAGES.EXIT].normal}
                            hoverImage={images[IMAGES.EXIT].hover}
                        />
                    </React.Fragment>
                    :
                    <HoverImage
                        message={images[IMAGES.PLUS].message}
                        onclick={toggleExpanded}
                        normalImage={images[IMAGES.PLUS].normal}
                        hoverImage={images[IMAGES.PLUS].hover}
                    />
            }
        </div>
    )
}