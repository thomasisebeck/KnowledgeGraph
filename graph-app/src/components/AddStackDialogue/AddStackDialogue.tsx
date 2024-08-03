import React, {useEffect, useState} from "react";
import Dialogue from "../Dialogue/Dialogue";

import s from "./AddStackDialogue.module.scss"
import {HOST} from "../../../../shared/variables";
import {RequestBody, Direction, RequestBodyConnection} from "../../../../shared/interfaces"

const BASE_CATEGORY_INDEX = -1;


function toggleButton(toggleDoubleSided: (index: number) => void, index: number, c: RequestBodyConnection, updateCategoryName: (newCategoryName: string, index: number) => void) {
    return <div className={s.innerDiv}>
        {
            c.direction === Direction.TOWARDS &&
            <div className={s.toggleButtonContainer}>
                <img onClick={() => toggleDoubleSided(index)} src={"buttons/up-arrow.svg"}/>
            </div>
        }
        {
            c.direction === Direction.AWAY &&
            <div className={s.toggleButtonContainer}>
                <img onClick={() => toggleDoubleSided(index)} src={"buttons/down-arrow.svg"}/>
            </div>
        }
        {
            c.direction === Direction.NEUTRAL &&
            <div className={s.toggleButtonContainer}>
                <img onClick={() => toggleDoubleSided(index)} src={"buttons/neutral.svg"}/>
            </div>
        }
        <input type={"text"} placeholder={"connection label"}
               onClick={() => {
                   updateCategoryName("", index);
               }}
               onBlur={(e) => {
                   updateCategoryName(e.target.value, index)
               }}
        />
    </div>;
}

function AddStackDialogue({hideAddStackDialogue}: { hideAddStackDialogue: () => void }) {

    const [categories, setCategories] = React.useState<RequestBodyConnection[]>([])
    const [baseCategory, setBaseCategory] = useState<RequestBodyConnection>({
        direction: Direction.AWAY,
        name: "Comp"
    })
    const [errorMessage, setErrorMessage] = useState("")
    const [info, setInfo] = useState("")

    const createStack = () => {
        function printDetails() {
            console.log(" ----------------------- ")
            console.log(" > Creating stack with the following items: < ")
            console.log("base")

            console.log("dir: ", baseCategory.direction)
            console.log("name: ", baseCategory.name)

            console.log(" > sub categories < ")
            for (const c of categories) {
                console.log("name: ", c.name);
                console.log("dir: ", c.direction);
            }

            console.log(" > info < ")
            console.log(info);
            console.log(" ----------------------- ")


        }

        printDetails();

        //todo: fix infoNode label
        const body: RequestBody = {
            classificationNodes: categories.map(c => c.name),
            connections: categories.map(c => {
                return {
                    name: c.name,
                    direction: c.direction
                }
            }),
            infoNode: {
                label: info,
                snippet: info,
            }
        }

        fetch(`${HOST}/createStack`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })


    }

    useEffect(() => {
        console.log("CURRENT CATEGORIES")
        categories.map(c => {
            console.log("name: ", c.name)
            console.log("direction: ", c.direction)
        })
        console.log("-------------------")
    }, [categories]);

    function updateCategoryName(newCategoryName: string, index: number) {

        if (index == BASE_CATEGORY_INDEX) { //update base category
            setBaseCategory({...baseCategory, name: newCategoryName});
            return;
        }
        console.log("UPDATING INDEX " + index + " TO " + newCategoryName)
        const old = categories;
        old[index].name = newCategoryName;
        setCategories(old);
        console.log("UPDATED")
    }

    function addBlankCategory() {
        setCategories([...categories, {
            direction: Direction.NEUTRAL,
            name: "new category"
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
                console.log("Setting base category")
                setBaseCategory({
                    name: copyBase.name,
                    direction: copyBase.direction
                });
                return;
            }
            console.error("NO base category found")
            return;
        }
        categories[index].direction = getNewCategory(categories[index].direction)
        setCategories([...categories]);
    }

    function tryCreateStack() {
        //check that eveything has been filled out
        //loop through the categories and see that they have the correct info

        for (const c of categories) {
            if (c.name == "new category" || c.name == "") {
                setErrorMessage("please fill out all the categories")
                return;
            }
        }

        if (categories.length < 2) {
            setErrorMessage("please create at least two subcategories")
            return;
        }

        if (info == "") {
            setErrorMessage("please fill out information in the space provided")
            return;
        }

        //all info filled out....
        //send a request
        createStack();

    }

    return (
        <Dialogue hideDialogue={hideAddStackDialogue} title={"Create Connection Stack"}>
            {
                errorMessage != "" &&
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
                {toggleButton(() => toggleDoubleSided(BASE_CATEGORY_INDEX), BASE_CATEGORY_INDEX, baseCategory, updateCategoryName)}
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
                                        onBlur={(e) => updateCategoryName(e.target.value, index)}
                                        placeholder={"new category name"}
                                    />
                                </div>
                            </div>

                            {/*arrow*/}
                            {toggleButton(toggleDoubleSided, index, c, updateCategoryName)}
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