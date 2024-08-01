import React, {useEffect, useState} from "react";
import Dialogue from "../Dialogue/Dialogue";

import s from "./AddStackDialogue.module.scss"

enum Direction {
    UP,
    DOWN,
    NEUTRAL
}

interface Category {
    direction: Direction
    name: string
}

function toggleButton(toggleDoubleSided: (index: number) => void, index: number, c: Category) {
    return <div onClick={() => toggleDoubleSided(index)} className={s.innerDiv}>
        {
            c.direction === Direction.UP &&
            <img src={"buttons/up-arrow.svg"}/>
        }
        {
            c.direction === Direction.DOWN &&
            <img src={"buttons/down-arrow.svg"}/>
        }
        {
            c.direction === Direction.NEUTRAL &&
            <img src={"buttons/neutral.svg"}/>
        }
    </div>;
}

function AddStackDialogue({hideAddStackDialogue}: { hideAddStackDialogue: () => void }) {

    const [categories, setCategories] = React.useState<Category[]>([])
    const [baseCategory, setBaseCategory] = useState<Category>({
        direction: Direction.UP,
        name: "Comp"
    })
    const [errorMessage, setErrorMessage] = useState("")
    const [info, setInfo] = useState("")

    const createStack = () => {
        function printDetails() {
            console.log(" ----------------------- ")
            console.log(" > Creating stack with the following items: < ")
            console.log("base")

            console.log("dir: " , baseCategory.direction)
            console.log("name: ", baseCategory.name)

            console.log(" > sub categories < ")
            for (const c of categories) {
                console.log("name: " , c.name);
                console.log("dir: " , c.direction);
            }

            console.log(" > info < ")
            console.log(info);
            console.log(" ----------------------- ")
        }
        printDetails();


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
                return Direction.DOWN;
            case Direction.DOWN:
                return Direction.UP;
            default:
                return Direction.NEUTRAL;
        }
    }

    function toggleDoubleSided(index: number, isBase: boolean = false) {
        if (isBase) {
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
                {toggleButton(() => toggleDoubleSided(0, true), -1, baseCategory)}
            </div>

            {
                categories.map((c, index) => (
                    <div className={s.category}>

                        <img src={"buttons/cancel.svg"} className={s.cancel}/>

                        {/*node*/}
                        <div className={s.nodeDivOuter}>
                            <div className={s.nodeDiv}></div>
                            <div className={s.content}>
                                <input
                                    type={"text"}
                                    onClick={(e) => e.currentTarget.value = ""}
                                    onBlur={(e) => updateCategoryName(e.target.value, index)}
                                />
                            </div>
                        </div>

                        {/*arrow*/}
                        {toggleButton(toggleDoubleSided, index, c)}
                    </div>
                ))
            }

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