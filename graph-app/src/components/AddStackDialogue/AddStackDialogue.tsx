import React, {useEffect, useState} from "react";
import Dialogue from "../Dialogue/Dialogue";

import s from "./AddStackDialogue.module.scss"
import {HOST} from "../../../../shared/variables";
import {RequestBody, Direction, RequestBodyConnection} from "../../../../shared/interfaces"
import * as zlib from "node:zlib";

const BASE_CATEGORY_INDEX = -1;

enum UpdateType {
    NODE_NAME,
    CONNECTION_NAME,
    CONNECTION_DIRECTION
}


function AddStackDialogue({hideAddStackDialogue}: { hideAddStackDialogue: () => void }) {

    const [categories, setCategories] = React.useState<RequestBodyConnection[]>([])
    const [baseCategory, setBaseCategory] = useState<RequestBodyConnection>({
        direction: Direction.AWAY,
        nodeName: "Comp",
        connectionName: ""
    })
    const [errorMessage, setErrorMessage] = useState("")
    const [showErr, setShowErr] = useState(false);
    const [info, setInfo] = useState("")

    const createStack = () => {
        console.log("CREATING...")

        function printDetails() {
            console.log(" ----------------------- ")
            console.log(" > Creating stack with the following items: < ")
            console.log("base")

            console.log("nodeName: ", baseCategory.nodeName)
            console.log("dir: ", baseCategory.direction)
            console.log("conn name: ", baseCategory.connectionName)
            console.log(" > sub categories < ")

            for (const c of categories) {
                console.log("name: ", c.nodeName);
                console.log("dir: ", c.direction);
                console.log("conn name: ", c.connectionName)
            }

            console.log(" > info < ")
            console.log(info);
            console.log(" ----------------------- ")
        }

        printDetails();

        const addedConnections = categories.map(c => {
            return {
                nodeName: c.nodeName,
                direction: c.direction,
                connectionName: c.connectionName
            }
        })

        const body: RequestBody = {
            connections: [
                {
                    connectionName: baseCategory.connectionName,
                    nodeName: baseCategory.nodeName,
                    direction: baseCategory.direction
                },
                ...addedConnections
            ],
            infoNode: {
                label: info,
                snippet: info,
            }
        }

        fetch(`${HOST}/createStack`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }).then(async result => {
            console.log("AFTER CREATING STACK")
            console.log(await result.json());
        })


    }

    function toggleButton(index: number, category: RequestBodyConnection) {
        return <div className={s.innerDiv}>
            {
                category.direction === Direction.TOWARDS &&
                <div className={s.toggleButtonContainer}>
                    <img onClick={() => toggleDoubleSided(index)} src={"buttons/up-arrow.svg"}
                         alt={"toggle direction up"}/>
                </div>
            }
            {
                category.direction === Direction.AWAY &&
                <div className={s.toggleButtonContainer}>
                    <img onClick={() => toggleDoubleSided(index)} src={"buttons/down-arrow.svg"}
                         alt={"toggle direction down"}/>
                </div>
            }
            {
                category.direction === Direction.NEUTRAL &&
                <div className={s.toggleButtonContainer}>
                    <img onClick={() => toggleDoubleSided(index)} src={"buttons/neutral.svg"}
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

    useEffect(() => {
        console.log("CURRENT CATEGORIES:")
        console.log("BASE:")
        console.log("name: ", baseCategory.nodeName)
        console.log("direction: ", baseCategory.direction)
        console.log("conn: ", baseCategory.connectionName)
        console.log("-------------------")
        console.log("OTHERS:")
        categories.map(c => {
            console.log("name: ", c.nodeName)
            console.log("direction: ", c.direction)
            console.log("conn: ", c.connectionName)
        })
        console.log("-------------------")
    }, [categories, baseCategory]);

    function updateCategory(index: number, value: string | Direction, updateType: UpdateType) {
        if (index == BASE_CATEGORY_INDEX) { //update base category
            switch (updateType) {
                case UpdateType.CONNECTION_DIRECTION:
                    setBaseCategory({...baseCategory, direction: value as Direction})
                    break;
                case UpdateType.CONNECTION_NAME:
                    setBaseCategory({...baseCategory, connectionName: value as string})
                    break;
                case UpdateType.NODE_NAME:
                    setBaseCategory({...baseCategory, nodeName: value as string});
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

    function addBlankCategory() {
        setCategories([...categories, {
            direction: Direction.NEUTRAL,
            nodeName: "",
            connectionName: ""
        }])
    }

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

    function toggleDoubleSided(index: number) {
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

    function showError(err: string) {
        setErrorMessage(err)
        setShowErr(true)
        console.log("SHOWING...")
        setTimeout(() => {
            setShowErr(false)
        }, 4000)
    }

    function isValidCategory(c: RequestBodyConnection) {
        return !(c.nodeName == "" || c.connectionName == "");
    }

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

            <div className={s.category}>

                {/*select*/}
                <div className={s.nodeDivOuter}>
                    <div className={s.nodeDiv}></div>
                    <div className={[s.content, s.customSelect].join(' ')}>
                        <select name={"base-category"}>
                            <option value={"Comp"}>Computer and Info Science</option>
                            <option value={"Phil"}>Philosophy</option>
                            <option value={"Psych"}>Psychology</option>
                            <option value={"Sci"}>Science</option>
                            <option value={"Lang"}>Language</option>
                            <option value={"Tech"}>Technology</option>
                            <option value={"Arts"}>Arts</option>
                            <option value={"Hist"}>History</option>
                            <option value={"Geo"}>Geography</option>
                        </select>
                    </div>
                </div>

                {/*arrow*/}
                {toggleButton(BASE_CATEGORY_INDEX, baseCategory)}
            </div>

            <div className={s.categoriesContainer}>

                {
                    categories.map((c, index) => (
                        <div className={s.category}>

                            <img src={"buttons/cancel.svg"} className={s.cancel} onClick={() => {
                                console.log("HI")
                                setCategories(old =>
                                    old.filter(((c, ind) => ind !== index))
                                );
                            }}/>


                            {/*node*/}
                            <div className={s.nodeDivOuter}>
                                <div className={s.nodeDiv}></div>
                                <div className={s.content}>
                                    <input
                                        type={"text"}
                                        onBlur={(e) => updateCategory(index, e.target.value, UpdateType.NODE_NAME)}
                                        placeholder={"new category name"}
                                    />
                                </div>
                            </div>

                            {/*arrow*/}
                            {toggleButton(index, c)}
                        </div>
                    ))
                }

            </div>

            {categories.length <= 3 &&
                <button onClick={addBlankCategory}>Add Category</button>
            }


            <hr/>
            <div className={s.textDiv}>
                <label>Information</label>
                <textarea onBlur={(e) => {
                    console.log("SETTING INFO")
                    setInfo(e.target.value)
                }
                }></textarea>
            </div>
            <button onClick={tryCreateStack}>Create Stack</button>
        </Dialogue>
    )
}

export default AddStackDialogue