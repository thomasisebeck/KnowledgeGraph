import s from "../AddStackDialogue/AddStackDialogue.module.scss";
import {
    Direction,
    RequestBodyConnection,
} from "../../../../shared/interfaces";
import React, {ReactNode} from "react";
import t from "./Toggle.module.scss";
import {toggleCategory} from "./CategoryUtils";

interface ToggleProps {
    index: number,
    category: RequestBodyConnection,
    children: ReactNode,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<
        React.SetStateAction<RequestBodyConnection[]>
    >,
    baseCategory: RequestBodyConnection,
    setBaseCategory: (value: React.SetStateAction<RequestBodyConnection>) => void
}

// function Toggle(index: number, category: RequestBodyConnection, toggleCategory: (index: number) => void,
// input:ReactNode) {
function Toggle({
    index,
    category,
    children,
    categories,
    setCategories,
    baseCategory,
    setBaseCategory
}: ToggleProps) {
    return (
        <div className={s.innerDiv}>
            {category.direction === Direction.TOWARDS && (
                <div className={s.toggleButtonContainer}>
                    <img
                        className={t.img}
                        onClick={() =>
                            toggleCategory(index, categories, setCategories, baseCategory, setBaseCategory)
                        }
                        src={"buttons/up-arrow.svg"}
                        alt={"toggle direction up"}
                    />
                </div>
            )}
            {category.direction === Direction.AWAY && (
                <div className={s.toggleButtonContainer}>
                    <img
                        className={t.img}
                        onClick={() =>
                            toggleCategory(index, categories, setCategories, baseCategory, setBaseCategory)
                        }
                        src={"buttons/down-arrow.svg"}
                        alt={"toggle direction down"}
                    />
                </div>
            )}
            {category.direction === Direction.NEUTRAL && (
                <div className={s.toggleButtonContainer}>
                    <img
                        className={t.img}
                        onClick={() =>
                            toggleCategory(index, categories, setCategories, baseCategory, setBaseCategory)
                        }
                        src={"buttons/neutral.svg"}
                        alt={"toggle direction neutral"}
                    />
                </div>
            )}
            {children}
        </div>
    );
}

export default Toggle;
