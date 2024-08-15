import React, {SetStateAction} from 'react'
import {UpdateType} from "../AddStackDialogue/DialogueUtils";
import {Direction, FrontendBaseCateogries, RequestBodyConnection} from "../../../../shared/interfaces";
import s from '../AddStackDialogue/AddStackDialogue.module.scss'
import Node from "../Node/Node";
import {updateCategoryUtil} from "../Categories.util"

interface Props {
    index: number,
    onUpdateCategory: any,
    c: RequestBodyConnection,
    isBaseCategory: boolean,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<React.SetStateAction<RequestBodyConnection[]>>,

    //if base category
    baseCategory?: RequestBodyConnection,
    dropDownBaseCategories?: FrontendBaseCateogries[],
    setBaseCategory?: (value: SetStateAction<RequestBodyConnection>) => void

    //if optional category
    onCancelClick?: () => void,
}

const BASE_CATEGORY_INDEX = -1;

export default function CategoryComp({
    c,
    dropDownBaseCategories,
    categories,
    setCategories,
    setBaseCategory,
    isBaseCategory,
    baseCategory,
    onUpdateCategory,
    index
}: Props) {

    const getNewCategory = (dir: Direction) => {
        switch (dir) {
            case Direction.NEUTRAL:
                return Direction.TOWARDS;
            case Direction.TOWARDS:
                return Direction.AWAY;
            default:
                return Direction.NEUTRAL;
        }
    }

    const onChangeBaseCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (dropDownBaseCategories && setBaseCategory && baseCategory) {

            const index = dropDownBaseCategories.findIndex(el => el.nodeId == e.target.value)

            //selected the empty category, so it won't be found
            if (index == -1) {
                //clear the base category if no option is selected
                setBaseCategory({...baseCategory, nodeId: "", nodeName: ""})
            } else
                //just set the name and nodeId when selecting the base category
                setBaseCategory({
                    ...baseCategory,
                    nodeId: dropDownBaseCategories[index].nodeId,
                    nodeName: dropDownBaseCategories[index].label
                })
        }
    }

    const onCancelClick = () => {
        setCategories(old => old.filter((c, ind) => ind != index))
    }

    function toggleButton(index: number, category: RequestBodyConnection, toggleCategory: (index: number) => void) {
        return (
            <div className={s.innerDiv}>
                {
                    category.direction === Direction.TOWARDS && <div className={s.toggleButtonContainer}>
                        <img onClick={() => toggleCategory(index)} src={"buttons/up-arrow.svg"}
                             alt={"toggle direction up"}/>
                    </div>
                }
                {
                    category.direction === Direction.AWAY && <div className={s.toggleButtonContainer}>
                        <img onClick={() => toggleCategoryDirection(index)} src={"buttons/down-arrow.svg"}
                             alt={"toggle direction down"}/>
                    </div>
                }
                {
                    category.direction === Direction.NEUTRAL && <div className={s.toggleButtonContainer}>
                        <img onClick={() => toggleCategoryDirection(index)} src={"buttons/neutral.svg"}
                             alt={"toggle direction neutral"}/>
                    </div>
                }
                <input type={"text"} placeholder={"connection label"}
                       onClick={() => {
                           updateCategoryUtil(index, setBaseCategory, baseCategory, "", UpdateType.CONNECTION_NAME,
                               setCategories, categories);
                       }}
                       onBlur={(e) => {
                           updateCategoryUtil(index, setBaseCategory, baseCategory, e.target.value,
                               UpdateType.CONNECTION_NAME, setCategories, categories);
                       }}
                />
            </div>
        );
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
                    isBaseCategory && <React.Fragment>
                        {/*Node showing base category*/}
                        <Node>
                            <select name={"base-category"} onChange={onChangeBaseCategory}>
                                <option value={""} key={""}></option>

                                {/*the id's are the root node id's*/}
                                {
                                    dropDownBaseCategories && dropDownBaseCategories.map(c => {
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
                    !isBaseCategory && <div className={s.category} key={index}>

                        <img src={"buttons/cancel.svg"} className={s.cancel} onClick={onCancelClick}/>

                        <Node>
                            <input
                                type={"text"}
                                onBlur={(e) => onUpdateCategory(index, setBaseCategory, baseCategory, e.target.value,
                                    UpdateType.NODE_NAME, setCategories, categories)}
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
