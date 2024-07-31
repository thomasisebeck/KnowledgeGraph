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
    const [currentCategory, setCurrentCategory] = useState("")
    const [baseCategory, setBaseCategory] = useState<Category>({
       direction: Direction.UP,
        name: "Comp"
    })

    const createStack = () => {
        console.log("Creating Stack (not implemented)");
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
        const old = categories;
        old[index].name = newCategoryName;
        setCategories(old);
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

    function toggleDoubleSided(index: number, isBase:boolean = false) {
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
                return ;
            }
            console.error("NO base category found")
            return;
        }
        categories[index].direction = getNewCategory(categories[index].direction)
        setCategories([...categories]);
    }

    return (
        <Dialogue hideDialogue={hideAddStackDialogue} title={"Create Connection Stack"}>
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
                                    type={"text"} value={c.name}
                                    onClick={(e) => e.currentTarget.value = ""}
                                    onChange={(e) => setCurrentCategory(e.target.value)}
                                    onBlur={(e) => updateCategoryName(e.target.value, index)}
                                />
                            </div>
                        </div>

                        {/*arrow*/}
                        {toggleButton(toggleDoubleSided, index, c)}
                    </div>
                ))
            }

            <button onClick={addBlankCategory}>Add Category</button>


            <hr/>
            <div className={s.textDiv}>
                <label>Information</label>
                <textarea>

                </textarea>
            </div>
            <button>Create Stack</button>
        </Dialogue>
    )
}

export default AddStackDialogue