import React, { useEffect, useState } from "react";
import Dialogue from "../Dialogue/Dialogue";
import {
    ConnectionPath,
    ConnectionPathConnection,
    CreateStackReturnBody,
    Direction,
    Neo4jNode,
    RequestBodyConnection,
    CLASS,
} from "../../../../shared/interfaces";
import {
    BASE_CATEGORY_INDEX,
    HOST,
    ERROR_MESSAGE_TIMEOUT,
} from "../../../../shared/variables";
import Node from "../Node/Node";
import CategoryComp from "../Category/CategoryComp";
import { UpdateType } from "../AddStackDialogue/DialogueUtils";
import Toggle from "../Category/Toggle";
import s from "../AddStackDialogue/AddStackDialogue.module.scss";

interface AddCategoryDialogueProps {
    hideDialogue: () => void;
    firstNodeId: string;
    secondNodeId: string;
    baseCategory: RequestBodyConnection;
    setBaseCategory: React.Dispatch<
        React.SetStateAction<RequestBodyConnection>
    >;
    categories: RequestBodyConnection[];
    setCategories: React.Dispatch<
        React.SetStateAction<RequestBodyConnection[]>
    >;
    updateCategory: (
        index: number,
        updateType: UpdateType,
        value: string | Direction,
    ) => void;
    addStackToFrontend: (body: CreateStackReturnBody) => void;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const AddCategoryDialogue = ({
    hideDialogue,
    categories,
    setCategories,
    baseCategory,
    setBaseCategory,
    firstNodeId,
    secondNodeId,
    updateCategory,
    addStackToFrontend,
    setErrorMessage,
}: AddCategoryDialogueProps) => {
    const [startNodeName, setStartNodeName] = useState<string>("");
    const [endNodeName, setEndNodeName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    //gets the start and end nodes of the connection
    const getNodes = async () => {
        setStartNodeName("science");
        setEndNodeName("meteorology");
    };

    //get the start and end node names
    useEffect(() => {
        getNodes();
    }, []);

    //when the user adds a new category
    const addBlankCategory = () => {
        setCategories([
            ...categories,
            {
                nodeName: "new category",
                connectionName: "new connection",
                direction: Direction.NEUTRAL,
            },
        ]);
    };

    //send the api request
    const createPath = async () => {
        //science <- uses - geology - includes ->

        const stack: CreateStackReturnBody = {
            nodes: [
                {
                    label: "geology",
                    nodeId: "geology",
                    nodeType: CLASS,
                },
            ],
            relationships: [
                {
                    type: "uses",
                    relId: "geology-science",
                    votes: 5,
                    to: "science",
                    from: "geology",
                    direction: Direction.TOWARDS,
                },
                {
                    type: "includes",
                    relId: "meteorology-geology",
                    votes: 5,
                    to: "meteorology",
                    from: "geology",
                    direction: Direction.AWAY
                },
            ],
        };

        addStackToFrontend(stack);
        hideDialogue();
    };


    return (
        <Dialogue
            hideDialogue={hideDialogue}
            title={"Add connection path between two nodes"}
        >
            {/*starting node*/}
            <Node>
                <div>{startNodeName.replaceAll("_", " ")}</div>
            </Node>

            <Toggle
                category={baseCategory!}
                index={BASE_CATEGORY_INDEX}
                categories={categories}
                setCategories={setCategories}
                baseCategory={baseCategory}
                setBaseCategory={setBaseCategory}
            >
                <input
                    type={"text"}
                    placeholder={"connection label"}
                    onClick={() =>
                        updateCategory(
                            BASE_CATEGORY_INDEX,
                            UpdateType.CONNECTION_NAME,
                            "",
                        )
                    }
                    onBlur={(e) => {
                        updateCategory(
                            BASE_CATEGORY_INDEX,
                            UpdateType.CONNECTION_NAME,
                            e.target.value,
                        );
                    }}
                />
            </Toggle>

            <div className={s.categoriesContainer}>
                {/*connection label for the first node*/}
                {categories.map((c, index) => (
                    <CategoryComp
                        key={index}
                        c={c}
                        categories={categories}
                        index={index}
                        updateCategory={updateCategory}
                        isBaseCategory={false}
                        setCategories={setCategories}
                        showCancel={true}
                        baseCategory={baseCategory}
                        setBaseCategory={setBaseCategory}
                        setErrorMessage={setErrorMessage}
                    />
                ))}
            </div>
            {/*ending node*/}
            <Node>
                <div>{endNodeName.replaceAll("_", " ")}</div>
            </Node>
            <button onClick={addBlankCategory}>Add Category</button>

            {isLoading ? (
                <button className={"buttonDisabled"}>Loading</button>
            ) : (
                <button onClick={createPath}>Create Path</button>
            )}
        </Dialogue>
    );
};
export default AddCategoryDialogue;
