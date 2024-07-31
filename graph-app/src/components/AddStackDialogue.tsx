import React from "react";
import Dialogue from "./Dialogue/Dialogue";

function AddStackDialogue({hideAddStackDialogue}: { hideAddStackDialogue: () => void }) {
    const createStack = () => {
        console.log("Creating Stack");
    }
    return (
        <Dialogue hideDialogue={hideAddStackDialogue} title={"Create Connection Stack"}>
            <div>
                <label>Base Category</label>
                <select name={"base-category"}>
                    <option value={""}></option>
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
            {/*todo: add extendable categories*/}
            <div>
                <label>Higher subcategory</label>
                <input type={"text"}/>
            </div>
            <div>
                <label>Lower subcategory</label>
                <input type={"text"}/>
            </div>
            <button>Create Stack</button>
        </Dialogue>
    )
}

export default AddStackDialogue