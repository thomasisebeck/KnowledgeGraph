import React, { useEffect, useState } from "react";
import { HoverImage } from "../HoverImage/HoverImage";
import s from "./AddButtons.module.scss";

interface AddButtonsProps {
    showAddBox: () => void;
    showAddStack: () => void;
    addCategory: () => void;
}

enum IMAGES {
    ADD_CONNECTION,
    ADD_NODE,
    EXIT,
    PLUS,
    ADD_CATEGORY_NODE,
}

const images = [
    {
        normal: "buttons/add-connection.svg",
        hover: "buttons/add-connection-hover.svg",
        message: "connect two nodes",
    },
    {
        normal: "buttons/add-node.svg",
        hover: "buttons/add-node-hover.svg",
        message: "create node with information",
    },
    {
        normal: "buttons/exit.svg",
        hover: "buttons/exit-hover.svg",
        message: "",
    },
    {
        normal: "buttons/plus.svg",
        hover: "buttons/plus-hover.svg",
        message: "",
    },
    {
        normal: "buttons/add-category-node.svg",
        hover: "buttons/add-category-node-hover.svg",
        message: "add connection path between two nodes",
    },
];

export const AddButtons = ({
    showAddBox,
    showAddStack,
    addCategory,
}: AddButtonsProps) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

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
            {expanded ? (
                <React.Fragment>
                    <HoverImage
                        message={images[IMAGES.ADD_NODE].message}
                        onclick={showAddStack}
                        normalImage={images[IMAGES.ADD_NODE].normal}
                        hoverImage={images[IMAGES.ADD_NODE].hover}
                    />
                    <HoverImage
                        message={images[IMAGES.ADD_CONNECTION].message}
                        onclick={showAddBox}
                        normalImage={images[IMAGES.ADD_CONNECTION].normal}
                        hoverImage={images[IMAGES.ADD_CONNECTION].hover}
                    />
                    <HoverImage
                        message={images[IMAGES.ADD_CATEGORY_NODE].message}
                        onclick={addCategory}
                        normalImage={images[IMAGES.ADD_CATEGORY_NODE].normal}
                        hoverImage={images[IMAGES.ADD_CATEGORY_NODE].hover}
                    />
                    <HoverImage
                        message={images[IMAGES.EXIT].message}
                        onclick={toggleExpanded}
                        normalImage={images[IMAGES.EXIT].normal}
                        hoverImage={images[IMAGES.EXIT].hover}
                    />
                </React.Fragment>
            ) : (
                <HoverImage
                    message={images[IMAGES.PLUS].message}
                    onclick={toggleExpanded}
                    normalImage={images[IMAGES.PLUS].normal}
                    hoverImage={images[IMAGES.PLUS].hover}
                />
            )}
        </div>
    );
};
