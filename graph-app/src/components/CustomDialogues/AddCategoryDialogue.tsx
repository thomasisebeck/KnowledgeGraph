import React, {useEffect, useState} from 'react'
import Dialogue from "../Dialogue/Dialogue";
import {Direction, Neo4jNode, RequestBodyConnection} from "../../../../shared/interfaces"
import {HOST, BASE_CATEGORY_INDEX} from "../../../../shared/variables"
import Node from '../Node/Node'
import CategoryComp from '../Category/CategoryComp'
import {updateCategoryUtil} from "../Categories.util";
import {UpdateType} from "../AddStackDialogue/DialogueUtils";
import Toggle from "../Category/Toggle";
import s from "../AddStackDialogue/AddStackDialogue.module.scss"
import {toggleCategory} from "../Category/CategoryUtils";

interface AddCategoryDialogueProps {
    hideDialogue: () => void,
    firstNodeId: string,
    secondNodeId: string,
}

const AddCategoryDialogue = ({hideDialogue, firstNodeId, secondNodeId}: AddCategoryDialogueProps) => {


    const [categories, setCategories] = useState<RequestBodyConnection[]>([{
        nodeName: "new category",
        direction: Direction.NEUTRAL,
        connectionName: "connection name"
    }]);

    const [startNodeName, setStartNodeName] = useState<string>("");
    const [endNodeName, setEndNodeName] = useState<string>("");

    const [baseConnection, setBaseConnection] = useState<RequestBodyConnection>({
        connectionName: "",
        nodeId: "",
        direction: Direction.NEUTRAL,
        nodeName: "",
    })


    //gets the start and end nodes of the connection
    const getNodes = async () => {
        const calls = [
            async (): Promise<Neo4jNode> => await fetch(`${HOST}/nodeName/${firstNodeId}`).then(res => res.json()),
            async (): Promise<Neo4jNode> => await fetch(`${HOST}/nodeName/${secondNodeId}`).then(res => res.json())
        ]

        const [node1, node2] = await Promise.all(calls.map(async fn => await fn()))
        console.log(node1)
        console.log(node2)

        setStartNodeName(node1.properties.label)
        setEndNodeName(node2.properties.label)

        //the base connection is the start node
        setBaseConnection({
            ...baseConnection,
            nodeId: node1.properties.nodeId,
            nodeName: node1.properties.label,
        })
    }

    //get the start and end node names
    useEffect(() => {
        getNodes();
    }, []);

    //when the user adds a new category
    const addBlankCategory = () => {
        setCategories([...categories, {
            nodeName: "new category",
            connectionName: "new connection",
            direction: Direction.NEUTRAL
        }])
    }



    return (
        <Dialogue hideDialogue={hideDialogue} title={"Add connection path between two nodes"}>

            {/*starting node*/}
            <Node>
                <div>
                    {startNodeName.replaceAll('_', ' ')}
                </div>
            </Node>

            <Toggle category={baseConnection!} index={BASE_CATEGORY_INDEX} categories={categories} setCategories={setCategories}>
                <input type={"text"} placeholder={"connection label"}
                   onClick={() => {
                       console.log("UPDATE BASE")
                       updateCategoryUtil(BASE_CATEGORY_INDEX, setBaseConnection, baseConnection, "", UpdateType.CONNECTION_NAME,
                           setCategories, categories);
                   }}
                   onBlur={(e) => {
                       updateCategoryUtil(BASE_CATEGORY_INDEX, setBaseConnection, baseConnection, e.target.value,
                           UpdateType.CONNECTION_NAME, setCategories, categories);
                   }}
            />
            </Toggle>

            <CategoryComp
                c={baseConnection}
                categories={categories}
                index={BASE_CATEGORY_INDEX}
                onUpdateCategory={updateCategoryUtil}
                isBaseCategory={true}
                setCategories={setCategories}
            />

            <div className={s.categoriesContainer}>

            {/*connection label for the first node*/}
            {
                categories.map((c, index) =>
                    <CategoryComp
                        key={index}
                        c={c}
                        categories={categories}
                        index={index}
                        onUpdateCategory={updateCategoryUtil}
                        isBaseCategory={false}
                        setCategories={setCategories}
                    />
                )
            }

            </div>
            {/*ending node*/}
            <Node>
                <div>
                    {endNodeName.replaceAll('_', ' ')}
                </div>
            </Node>
            <button onClick={addBlankCategory}>Add Category</button>
        </Dialogue>

    )
}
export default AddCategoryDialogue
