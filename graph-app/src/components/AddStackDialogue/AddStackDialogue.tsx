import React from "react";
import Dialogue from "../Dialogue/Dialogue";
import s from "./AddStackDialogue.module.scss";
import { RequestBodyConnection } from "../../../../shared/interfaces";
import { infoHover } from "../../InfoHover";

function AddStackDialogue({
    hideAddStackDialogue,
    isLoading,
    addBlankCategory,
    tryCreateStack,
    categories,
    setHeading,
    setInfo,
    children,
}: {
    hideAddStackDialogue: () => void;
    isLoading: boolean;
    categories: RequestBodyConnection[];
    addBlankCategory: () => void;
    tryCreateStack: () => void;
    setHeading: React.Dispatch<React.SetStateAction<string>>;
    setInfo: React.Dispatch<React.SetStateAction<string>>;
    children: React.ReactNode;
}) {
    return (
        <Dialogue
            hideDialogue={hideAddStackDialogue}
            title={"Create Connection Stack"}
        >

            {infoHover(65, 12, "Overlay a stack onto the graph. A stack is a bunch of connections and classification nodes that starts from a root node and ends at the piece of information you want to add. Try to add logical links.", 400)}

            {/* base category with dropdown (passed down)*/}
            {/* show the custom categories the user has added */}
            {children}

            {/* allow the user to add more categories if there are fewer than 3*/}
            {categories.length <= 3 && (
                <button onClick={addBlankCategory}>Add Category</button>
            )}

            <hr />

            {/* for filling out the information */}
            <div className={s.textDiv}>
                {infoHover(0, -5, "Give the information a meaningful title. Try to keep it short.", 250)}
                <label>Title</label>
                <input
                    type={"text"}
                    onBlur={(e) => setHeading(e.target.value)}
                />
                {infoHover(0, 57, "Add the information here.", 200)}
                <label>Information</label>
                <textarea
                    onBlur={(e) => {
                        setInfo(e.target.value);
                    }}
                ></textarea>
            </div>

            {/* button that shows if the API request is busy */}
            {isLoading ? (
                <button className={"buttonDisabled"}>
                    <div>Please wait...</div>
                </button>
            ) : (
                <button onClick={tryCreateStack}>Create Stack</button>
            )}
        </Dialogue>
    );
}

export default AddStackDialogue;
