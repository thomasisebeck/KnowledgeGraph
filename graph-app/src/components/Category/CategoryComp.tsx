import React, {SetStateAction} from 'react'
import {UpdateType} from "../AddStackDialogue/DialogueUtils";
import {FrontendBaseCateogries, RequestBodyConnection, Direction} from "../../../../shared/interfaces";
import s from '../AddStackDialogue/AddStackDialogue.module.scss'
import Node from "../Node/Node";
import Toggle from "./Toggle";
import {updateCategoryUtil} from "../Categories.util";
import t from "./Toggle.module.scss"

interface Props {
    index: number,
    onUpdateCategory: any,
    c: RequestBodyConnection,
    isBaseCategory: boolean,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<React.SetStateAction<RequestBodyConnection[]>>,
    baseCategory?: RequestBodyConnection,
    dropDownBaseCategories?: FrontendBaseCateogries[],
    setBaseCategory?: (value: SetStateAction<RequestBodyConnection>) => void,
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
    index,
}: Props) {


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


    return (
        <div className={s.category}>
            <div className={[s.content, s.customSelect].join(' ')}>

                {
                    isBaseCategory && baseCategory && <React.Fragment>

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
                        {/*update using base category index*/}
                        <Toggle category={baseCategory!} index={BASE_CATEGORY_INDEX} categories={categories} setCategories={setCategories}>
                            <input type={"text"} placeholder={"connection label"}
                                   onClick={() => {
                                       updateCategoryUtil(BASE_CATEGORY_INDEX, setBaseCategory, baseCategory, "",
                                           UpdateType.CONNECTION_NAME,
                                           setCategories, categories);
                                   }}
                                   onBlur={(e) => {
                                       updateCategoryUtil(BASE_CATEGORY_INDEX, setBaseCategory, baseCategory,
                                           e.target.value,
                                           UpdateType.CONNECTION_NAME, setCategories, categories);
                                   }}
                            />
                        </Toggle>
                    </React.Fragment>
                }


                {
                    !isBaseCategory && <div className={s.category}>

                        <img src={"buttons/cancel.svg"} className={[t.img, t.cancel].join(' ')}
                             onClick={onCancelClick}/>

                        <Node>
                            <input
                                type={"text"}
                                onBlur={(e) => onUpdateCategory(index, setBaseCategory, baseCategory, e.target.value,
                                    UpdateType.NODE_NAME, setCategories, categories)}
                                placeholder={"new category name"}
                            />
                        </Node>

                        {/*arrows*/}
                        {/*extract the toggle, but keep the input in the parent state*/}
                        {/*update using required index*/}
                        <Toggle index={index}  category={c} categories={categories} setCategories={setCategories}>
                            <input type={"text"} placeholder={"connection label"}
                                   onClick={() => {
                                       updateCategoryUtil(index, setBaseCategory, baseCategory, "",
                                           UpdateType.CONNECTION_NAME,
                                           setCategories, categories);
                                   }}
                                   onBlur={(e) => {
                                       updateCategoryUtil(index, setBaseCategory, baseCategory, e.target.value,
                                           UpdateType.CONNECTION_NAME, setCategories, categories);
                                   }}
                            />
                        </Toggle>

                    </div>
                }

            </div>
        </div>
    )
}
