import React, {useEffect, useState} from "react";
import Dialogue from "../Dialogue/Dialogue";
import {ConnectionPath, Direction, Neo4jNode, RequestBodyConnection} from "../../../../shared/interfaces";
import {BASE_CATEGORY_INDEX, HOST} from "../../../../shared/variables";
import Node from "../Node/Node";
import CategoryComp from "../Category/CategoryComp";
import {UpdateType} from "../AddStackDialogue/DialogueUtils";
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
}: AddCategoryDialogueProps) => {
    const [startNodeName, setStartNodeName] = useState<string>("");
    const [endNodeName, setEndNodeName] = useState<string>("");

    //gets the start and end nodes of the connection
    const getNodes = async () => {
        const calls = [
            async (): Promise<Neo4jNode> =>
                await fetch(`${HOST}/nodeName/${firstNodeId}`).then((res) =>
                    res.json(),
                ),
            async (): Promise<Neo4jNode> =>
                await fetch(`${HOST}/nodeName/${secondNodeId}`).then((res) =>
                    res.json(),
                ),
        ];

        const [node1, node2] = await Promise.all(
            calls.map(async (fn) => await fn()),
        );
        console.log(node1);
        console.log(node2);

        setStartNodeName(node1.properties.label);
        setEndNodeName(node2.properties.label);

        //the base connection is the start node
        setBaseCategory({
            ...baseCategory,
            nodeId: node1.properties.nodeId,
            nodeName: node1.properties.label,
        });
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
        //print the details
        /*
        (() => {
            console.log(" ----------------------- ");
            console.log(" > Creating stack with the following items: < ");

            console.log("startNode");
            console.log("name: ", baseCategory.nodeName);
            console.log("dir: ", baseCategory.direction);
            console.log("conn name: ", baseCategory.connectionName);
            console.log("id: ", firstNodeId);

            categories.forEach((c) => {
                console.log("name: ", c.nodeName);
                console.log("dir: ", c.direction);
                console.log("conn name: ", c.connectionName);
            });

            console.log("endNode");
            console.log("id: ", secondNodeId);
        })();
        */

        const body: ConnectionPath = {
            categories: categories,
            firstNodeId: firstNodeId,
            secondNodeId: secondNodeId
        }

        console.log("fetching ...")
        await fetch(`${HOST}/connectionPath`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then(async res => {
            console.log("After creating connection path...")
            console.log(await res.json())
        })
        console.log("done")

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
                    />
                ))}
            </div>
            {/*ending node*/}
            <Node>
                <div>{endNodeName.replaceAll("_", " ")}</div>
            </Node>
            <button onClick={addBlankCategory}>Add Category</button>
            <button onClick={createPath}>Create Path</button>
        </Dialogue>
    );
};
export default AddCategoryDialogue;
