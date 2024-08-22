import React, {useEffect, useState} from "react";
import Dialogue from "../Dialogue/Dialogue";
import {
    ConnectionPath,
    ConnectionPathConnection,
    CreateStackReturnBody,
    Direction,
    Neo4jNode,
    RequestBodyConnection
} from "../../../../shared/interfaces";
import {BASE_CATEGORY_INDEX, HOST} from "../../../../shared/variables";
import Node from "../Node/Node";
import CategoryComp from "../Category/CategoryComp";
import {UpdateType} from "../AddStackDialogue/DialogueUtils";
import Toggle from "../Category/Toggle";
import s from "../AddStackDialogue/AddStackDialogue.module.scss";

interface AddCategoryDialogueProps {
    hideDialogue: () => void,
    firstNodeId: string,
    secondNodeId: string,
    baseCategory: RequestBodyConnection,
    setBaseCategory: React.Dispatch<
        React.SetStateAction<RequestBodyConnection>
    >,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<
        React.SetStateAction<RequestBodyConnection[]>
    >,
    updateCategory: (
        index: number,
        updateType: UpdateType,
        value: string | Direction,
    ) => void,
    addStackToFrontend: (body: CreateStackReturnBody) => void,
    setErrorMessage: (value: (((prevState: string) => string) | string)) => void
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
    setErrorMessage
}: AddCategoryDialogueProps) => {
    const [startNodeName, setStartNodeName] = useState<string>("");
    const [endNodeName, setEndNodeName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false)

    //gets the start and end nodes of the connection
    const getNodes = async () => {
        const calls = [
            async (): Promise<Neo4jNode> =>
                await fetch(`${HOST}/nodeName/${firstNodeId}`).then((res) => {

                    if (!res.ok)
                        throw res.statusText;

                    return res.json()
                }),
            async (): Promise<Neo4jNode> =>
                await fetch(`${HOST}/nodeName/${secondNodeId}`).then((res) => {

                    if (!res.ok)
                        throw res.statusText;

                    return res.json()
                }),
        ];

        try {

            const [node1, node2] = await Promise.all(
                calls.map(async (fn) => await fn()),
            );
            setStartNodeName(node1.properties.label);
            setEndNodeName(node2.properties.label);

            //the base connection is the start node
            setBaseCategory({
                ...baseCategory,
                nodeId: node1.properties.nodeId,
                nodeName: node1.properties.label,
            });

        } catch (e) {
            setErrorMessage(e as string)
        }

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

        setIsLoading(true)

        const nodes: string[] = categories.map(c => c.nodeName)
        let connections: ConnectionPathConnection[] = [];

        //push the base connection
        connections.push({
            label: baseCategory.connectionName,
            direction: baseCategory.direction
        });

        //push each other connection
        connections = connections.concat(categories.map(c => {
            return {
                label: c.connectionName,
                direction: c.direction
            }
        }))

        const body: ConnectionPath = {
            firstNodeId: firstNodeId,
            secondNodeId: secondNodeId,
            nodes: nodes,
            connections: connections
        }

        await fetch(`${HOST}/connectionPath`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then(async res => {

            hideDialogue()

            if (!res.ok) {
                setErrorMessage(res.statusText);
                return;
            }

            const result = await res.json() as CreateStackReturnBody;
            setIsLoading(false)
            addStackToFrontend(result);
        })

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
                    />
                ))}
            </div>
            {/*ending node*/}
            <Node>
                <div>{endNodeName.replaceAll("_", " ")}</div>
            </Node>
            <button onClick={addBlankCategory}>Add Category</button>

            {isLoading ?
                <button className={"buttonDisabled"}>Loading</button>
                :
                <button onClick={createPath}>Create Path</button>
            }
        </Dialogue>
    );
};
export default AddCategoryDialogue;
