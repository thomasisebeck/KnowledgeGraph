import React, {Dispatch, SetStateAction} from 'react'
import {UpdateType} from "../AddStackDialogue/DialogueUtils";
import {Category, Direction, FrontendBaseCateogries, RequestBodyConnection} from "../../../../shared/interfaces";
import s from '../AddStackDialogue/AddStackDialogue.module.scss'
import Node from "../Node/Node";

interface Props {
    index: number,
    onCancelClick?: () => void,

    onUpdateCategory:any,
    c: RequestBodyConnection,
    isBaseCategory: boolean,
    baseCategory?: RequestBodyConnection,
    baseCategories?: FrontendBaseCateogries[],
    setBaseCategory?: (value: SetStateAction<RequestBodyConnection>) => void,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<React.SetStateAction<RequestBodyConnection[]>>,
    onChangeBaseCategory?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const BASE_CATEGORY_INDEX = -1;

export default function CategoryComp(
    {
        c,
        onChangeBaseCategory, baseCategories, categories,
        setCategories, setBaseCategory, isBaseCategory, baseCategory,
        onUpdateCategory, onCancelClick, index
    }
        : Props) {

    function getNewCategory(dir: Direction) {
        switch (dir) {
            case Direction.NEUTRAL:
                return Direction.TOWARDS;
            case Direction.TOWARDS:
                return Direction.AWAY;
            default:
                return Direction.NEUTRAL;
        }
    }

    function toggleButton(index: number, category: RequestBodyConnection, toggleCategory: (index: number) => void) {
        return <div className={s.innerDiv}>
            {
                category.direction === Direction.TOWARDS &&
                <div className={s.toggleButtonContainer}>
                    <img onClick={() => toggleCategory(index)} src={"buttons/up-arrow.svg"}
                         alt={"toggle direction up"}/>
                </div>
            }
            {
                category.direction === Direction.AWAY &&
                <div className={s.toggleButtonContainer}>
                    <img onClick={() => toggleCategoryDirection(index)} src={"buttons/down-arrow.svg"}
                         alt={"toggle direction down"}/>
                </div>
            }
            {
                category.direction === Direction.NEUTRAL &&
                <div className={s.toggleButtonContainer}>
                    <img onClick={() => toggleCategoryDirection(index)} src={"buttons/neutral.svg"}
                         alt={"toggle direction neutral"}/>
                </div>
            }
            <input type={"text"} placeholder={"connection label"}
                   onClick={() => {
                       updateCategory(index, "", UpdateType.CONNECTION_NAME);
                   }}
                   onBlur={(e) => {
                       updateCategory(index, e.target.value, UpdateType.CONNECTION_NAME);
                   }}
            />
        </div>;
    }

    function updateCategory(index: number, value: string | Direction, updateType: UpdateType) {
        if (index == BASE_CATEGORY_INDEX) { //update base category
            switch (updateType) {
                case UpdateType.CONNECTION_DIRECTION:
                    setBaseCategory!({...baseCategory!, direction: value as Direction})
                    break;
                case UpdateType.CONNECTION_NAME:
                    setBaseCategory!({...baseCategory!, connectionName: value as string})
                    break;
                case UpdateType.NODE_NAME:
                    setBaseCategory!({...baseCategory!, nodeName: value as string});
                    break;
            }

            return;
        }

        switch (updateType) {
            case UpdateType.CONNECTION_DIRECTION:
                setCategories(categories.map(((e, ind) => {
                    if (ind == index)
                        return {...e, direction: value as Direction}
                    return e;
                })));
                break;
            case UpdateType.CONNECTION_NAME:
                setCategories(categories.map(((e, ind) => {
                    if (ind == index)
                        return {...e, connectionName: value as string}
                    return e;
                })));

                break;
            case UpdateType.NODE_NAME:
                setCategories(categories.map(((e, ind) => {
                    if (ind == index)
                        return {...e, nodeName: value as string}
                    return e;
                })));

                break;
        }
    }

    const toggleCategoryDirection = (index: number) => {
        if (isBaseCategory) {
            //handle base category separately
            let copyBase = baseCategory!;
            if (copyBase) {
                copyBase.direction = getNewCategory(copyBase?.direction);
                setBaseCategory!({...copyBase});
                return;
            }
            throw "no base category found"
        }
        categories[index].direction = getNewCategory(categories[index].direction)
        setCategories([...categories]);
    }

    return (
        <div className={s.category}>


            <div className={[s.content, s.customSelect].join(' ')}>

                {
                    isBaseCategory &&
                    <React.Fragment>
                        {/*Node showing base category*/}
                        <Node>
                            <select name={"base-category"} onChange={onChangeBaseCategory}>
                                <option value={""} key={""}></option>
                                {
                                    //the id's are the root node id's
                                    baseCategories && baseCategories.map(c => {
                                        return <option value={c.nodeId} key={c.nodeId}>{c.label}</option>
                                    })
                                }
                            </select>
                        </Node>

                        {/*arrow*/}
                        {toggleButton(BASE_CATEGORY_INDEX, baseCategory!, toggleCategoryDirection)}
                    </React.Fragment>
                }

                {
                    !isBaseCategory &&
                    <div className={s.category} key={index}>

                        <img src={"buttons/cancel.svg"} className={s.cancel} onClick={onCancelClick}/>

                        {/*Node showing other categories*/}
                        {/*
                         onUpdateCategory: (
        index: number,
        setBaseCategory: (value: React.SetStateAction<RequestBodyConnection>) => void,
        baseCategory: any,
        value: string | Direction,
        updateType: UpdateType,
        setCategories: React.Dispatch<React.SetStateAction<RequestBodyConnection[]>>,
        categories: RequestBodyConnection[])
            => React.JSX.Element | undefined,
                        */}
                        <Node>
                            <input
                                type={"text"}
                                onBlur={(e) => onUpdateCategory(index, setBaseCategory, baseCategory, e.target.value, UpdateType.NODE_NAME, setCategories, categories)}
                                // onBlur={(e) => onUpdateCategory(index,BASE_CATEGORY_INDEX, setBaseCategory, baseCategory, e.target.value, UpdateType.NODE_NAME, setCategories, categories)}
                                placeholder={"new category name"}
                            />
                        </Node>

                        {/*arrows*/}
                        {toggleButton(index, c, toggleCategoryDirection)}
                    </div>
                }


            </div>

        </div>

    )
}
