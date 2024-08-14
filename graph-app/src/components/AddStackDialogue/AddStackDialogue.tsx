import React, {ReactNode, useState} from "react";
import Dialogue from "../Dialogue/Dialogue";

import s from "./AddStackDialogue.module.scss"
import {HOST} from "../../../../shared/variables";
import {
    CreateStackReturnBody,
    Direction,
    FrontendBaseCateogries,
    RequestBody,
    RequestBodyConnection,
} from "../../../../shared/interfaces"
import {UpdateType} from "./DialogueUtils";
import Node from "../Node/Node"
import CategoryComp from "../Category/CategoryComp";
import {updateCategoryUtil} from "../Categories.util"

interface CategoryProps {
    index: number;
    onCancelClick: () => void; // Assuming cancelClick doesn't require any arguments
    onUpdateCategory: (index: number, value: string, updateType: UpdateType) => void;
    c: RequestBodyConnection; // Replace with appropriate type if known
    children: ReactNode
}

const BASE_CATEGORY_INDEX = -1;
//
// export function Category({index, onCancelClick, onUpdateCategory, children}: CategoryProps) {
//     return <div className={s.category} key={index}>
//
//         <img src={"buttons/cancel.svg"} className={s.cancel} onClick={onCancelClick}/>
//
//         {/*node*/}
//         <Node>
//             <input
//                 type={"text"}
//                 onBlur={(e) => onUpdateCategory(index, e.target.value, UpdateType.NODE_NAME)}
//                 placeholder={"new category name"}
//             />
//         </Node>
//
//         {children}
//
//     </div>
// }

function AddStackDialogue({hideAddStackDialogue, addStackToFrontend, isLoading, setStackLoading, baseCategories}: {
    hideAddStackDialogue: () => void,
    addStackToFrontend: (body: CreateStackReturnBody) => void,
    isLoading: boolean,
    setStackLoading: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    baseCategories: FrontendBaseCateogries[]
}) {

    const [categories, setCategories] = React.useState<RequestBodyConnection[]>([])
    const [baseCategory, setBaseCategory] = useState<RequestBodyConnection>({
        direction: Direction.AWAY,
        nodeName: "",
        connectionName: "",
        nodeId: ""
    })
    const [errorMessage, setErrorMessage] = useState("")
    const [showErr, setShowErr] = useState(false);
    const [info, setInfo] = useState("")
    const [heading, setHeading] = useState("")

    //send the request to the api to add the stack
    //then update the UI
    const createStack = () => {

        //print details
        (() => {
            console.log(" ----------------------- ")
            console.log(" > Creating stack with the following items: < ")
            console.log("base")

            console.log("nodeName: ", baseCategory.nodeName)
            console.log("dir: ", baseCategory.direction)
            console.log("conn name: ", baseCategory.connectionName)
            console.log("node id: ", baseCategory.nodeId)
            console.log(" > sub categories < ")

            for (const c of categories) {
                console.log("name: ", c.nodeName);
                console.log("dir: ", c.direction);
                console.log("conn name: ", c.connectionName)
            }

            console.log(" > info < ")
            console.log(heading)
            console.log(info);
            console.log(" ----------------------- ")
        })()

        //get the connections from the state
        const addedConnections: RequestBodyConnection[] = categories.map(c => {
            return {
                nodeName: c.nodeName,
                direction: c.direction,
                connectionName: c.connectionName
            }
        })

        //construct the request
        const body: RequestBody = {
            rootNodeId: baseCategory.nodeId!,
            connections: [
                {
                    connectionName: baseCategory.connectionName,
                    nodeName: baseCategory.nodeName,
                    direction: baseCategory.direction
                },
                ...addedConnections
            ],
            infoNode: {
                label: heading,
                snippet: info,
            }
        }

        //button loading
        setStackLoading(true);

        fetch(`${HOST}/createStack`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }).then(async result => {
            console.log("App.ts AFTER CREATING STACK")

            if (result.status === 200) {
                const body = await result.json() as CreateStackReturnBody;
                addStackToFrontend(body);
            } else {
                console.error("Cannot add stack to frontend");
                console.error(result.status)
                console.error(result)
            }

            setStackLoading(false);
        })

    }

    //when you click on add category
    function addBlankCategory() {
        setCategories([...categories, {
            direction: Direction.NEUTRAL,
            nodeName: "",
            connectionName: ""
        }])
    }

    //cycle the direction of the arrow
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

    //fire the cycling of directions
    function toggleCategoryDirection(index: number) {
        if (index == BASE_CATEGORY_INDEX) {
            //handle base category separately
            let copyBase = baseCategory;
            if (copyBase) {
                copyBase.direction = getNewCategory(copyBase?.direction);
                setBaseCategory({...copyBase});
                return;
            }
            throw "no base category found"
        }
        categories[index].direction = getNewCategory(categories[index].direction)
        setCategories([...categories]);
    }

    //show the error message for a short time
    function showError(err: string) {
        setErrorMessage(err)
        setShowErr(true)
        setTimeout(() => {
            setShowErr(false)
        }, 4000)
    }

    //category is not blank
    function isValidCategory(c: RequestBodyConnection) {
        return !(c.nodeName == "" || c.connectionName == "");
    }

    //validate that everything is filled out
    function tryCreateStack() {
        //check that eveything has been filled out
        //loop through the categories and see that they have the correct info

        for (const c of categories) {
            if (!isValidCategory(c)) {
                showError("please fill out all the categories")
                return;
            }
        }

        if (!isValidCategory(baseCategory)) {
            showError("please fill out all the categories")
            return;
        }

        if (categories.length < 2) {
            showError("please create at least two subcategories")
            return;
        }

        if (info == "") {
            showError("please fill out information in the space provided")
            return;
        }

        //all info filled out....
        //send a request
        createStack();
    }

    const onChangeBaseCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = baseCategories.findIndex(el => el.nodeId == e.target.value)

        //selected the empty category, so it won't be found
        if (index == -1) {
            //clear the base category if no option is selected
            setBaseCategory({...baseCategory, nodeId: "", nodeName: ""})
        } else
            //just set the name and nodeId when selecting the base category
            setBaseCategory({
                ...baseCategory,
                nodeId: baseCategories[index].nodeId,
                nodeName: baseCategories[index].label
            })
    }

    return (
        <Dialogue hideDialogue={hideAddStackDialogue} title={"Create Connection Stack"}>

            {
                showErr &&
                <div className={s.error}>
                    <div className={s.errorInner}>
                        {errorMessage}
                    </div>
                </div>
            }

            {/* base category with dropdown */}
            <CategoryComp
                index={BASE_CATEGORY_INDEX}
                onUpdateCategory={updateCategoryUtil}
                c={baseCategory}
                isBaseCategory={true}
                baseCategory={baseCategory}
                baseCategories={baseCategories}
                setBaseCategory={setBaseCategory}
                categories={categories}
                setCategories={setCategories}
                onChangeBaseCategory={onChangeBaseCategory}
            />

            {/*<div className={s.category}>*/}

            {/*    <div className={[s.content, s.customSelect].join(' ')}>*/}

            {/*        <Node>*/}
            {/*            <select name={"base-category"} onChange={onChangeBaseCategory}>*/}
            {/*                <option value={""} key={""}></option>*/}
            {/*                {*/}
            {/*                    //the id's are the root node id's*/}
            {/*                    baseCategories.map(c => {*/}
            {/*                        return <option value={c.nodeId} key={c.nodeId}>{c.label}</option>*/}
            {/*                    })*/}
            {/*                }*/}
            {/*            </select>*/}
            {/*        </Node>*/}
            {/*    </div>*/}

            {/*    /!*arrow*!/*/}
            {/*    {toggleButton(BASE_CATEGORY_INDEX, baseCategory, toggleCategoryDirection)}*/}
            {/*</div>*/}

            <div className={s.categoriesContainer}>

                {
                    categories.map((c, index) =>
                        // <Category
                        //     key={index}
                        //     index={index}
                        //     onCancelClick={() => setCategories(old => old.filter((c, ind) => ind != index))}
                        //     onUpdateCategory={updateCategory}
                        //     c={c}>
                        //
                        //     {/*Add the toggle button*/}
                        //     {toggleButton(index, c, toggleCategoryDirection)}
                        // </Category>
                        <CategoryComp
                            key={index}
                            index={index}
                            onUpdateCategory={updateCategoryUtil}
                            c={c}
                            isBaseCategory={false}
                            categories={categories}
                            setCategories={setCategories}

                            //filter out the current category
                            onCancelClick={() => setCategories(old => old.filter((c, ind) => ind != index))}
                        />
                    )
                }

            </div>

            {categories.length <= 3 &&
                <button onClick={addBlankCategory}>Add Category</button>
            }

            <hr/>

            <div className={s.textDiv}>
                <input
                    type={"text"}
                    onBlur={(e) => setHeading(e.target.value)}
                    placeholder={"title"}
                />
                <label>Information</label>
                <textarea onBlur={(e) => {
                    setInfo(e.target.value)
                }
                }></textarea>
            </div>

            {
                isLoading ?
                    <button className={"buttonDisabled"}>
                        <div>
                            Please wait...
                        </div>
                    </button>
                    :
                    <button onClick={tryCreateStack}>
                        Create Stack
                    </button>

            }

        </Dialogue>
    )
}

export default AddStackDialogue