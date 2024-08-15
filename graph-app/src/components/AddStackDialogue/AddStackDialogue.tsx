import React, {useState} from "react";
import Dialogue from "../Dialogue/Dialogue";
import s from "./AddStackDialogue.module.scss"
import {BASE_CATEGORY_INDEX, HOST} from "../../../../shared/variables";
import {
    CreateStackReturnBody,
    Direction,
    FrontendBaseCateogries,
    RequestBody,
    RequestBodyConnection,
} from "../../../../shared/interfaces"
import CategoryComp from "../Category/CategoryComp";
import {updateCategoryUtil} from "../Categories.util"
import Error from "../Error/Error"

function AddStackDialogue({hideAddStackDialogue, addStackToFrontend, isLoading, setStackLoading, baseCategories}: {
    hideAddStackDialogue: () => void,
    addStackToFrontend: (body: CreateStackReturnBody) => void,
    isLoading: boolean,
    setStackLoading: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    baseCategories: FrontendBaseCateogries[]
}) {

    const [categories, setCategories] = React.useState<RequestBodyConnection[]>([])
    const [baseCategory, setBaseCategory] = useState<RequestBodyConnection>({
        direction: Direction.AWAY, nodeName: "", connectionName: "", nodeId: ""
    })
    const [errorMessage, setErrorMessage] = useState("")
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
                nodeName: c.nodeName, direction: c.direction, connectionName: c.connectionName
            }
        })

        //construct the request
        const body: RequestBody = {
            rootNodeId: baseCategory.nodeId!, connections: [{
                connectionName: baseCategory.connectionName,
                nodeName: baseCategory.nodeName,
                direction: baseCategory.direction
            }, ...addedConnections], infoNode: {
                label: heading, snippet: info,
            }
        }

        //button loading
        setStackLoading(true);

        fetch(`${HOST}/createStack`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
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
            direction: Direction.NEUTRAL, nodeName: "", connectionName: ""
        }])
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
                setErrorMessage("please fill out all the categories")
                return;
            }
        }

        if (!isValidCategory(baseCategory)) {
            setErrorMessage("please fill out all the categories")
            return;
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

            {// if there is an error (something is not filled out)
                errorMessage != "" && Error(errorMessage)}

            {/* base category with dropdown */}
            <CategoryComp
                index={BASE_CATEGORY_INDEX}
                onUpdateCategory={updateCategoryUtil}
                c={baseCategory}
                isBaseCategory={true}
                baseCategory={baseCategory}
                dropDownBaseCategories={baseCategories}
                setBaseCategory={setBaseCategory}
                categories={categories}
                setCategories={setCategories}
            />

            {/* show the custom categories the user has added */}
            <div className={s.categoriesContainer}>
                {categories.map((c, index) => <CategoryComp
                    key={index}
                    index={index}
                    onUpdateCategory={updateCategoryUtil}
                    c={c}
                    isBaseCategory={false}
                    categories={categories}
                    setCategories={setCategories}
                />)}
            </div>

            {/* allow the user to add more categories if there are fewer than 3*/}
            {categories.length <= 3 && <button onClick={addBlankCategory}>Add Category</button>}

            <hr/>

            {/* for filling out the information */}
            <div className={s.textDiv}>
                <input
                    type={"text"}
                    onBlur={(e) => setHeading(e.target.value)}
                    placeholder={"title"}
                />
                <label>Information</label>
                <textarea onBlur={(e) => {
                    setInfo(e.target.value)
                }}></textarea>
            </div>

            {/* button that shows if the API request is busy */}
            {isLoading ? <button className={"buttonDisabled"}>
                <div>
                    Please wait...
                </div>
            </button> : <button onClick={tryCreateStack}>
                Create Stack
            </button>

            }
        </Dialogue>
    )
}

export default AddStackDialogue