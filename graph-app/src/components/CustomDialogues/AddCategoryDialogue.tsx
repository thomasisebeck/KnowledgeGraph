import React, {useEffect, useState} from 'react'
import Dialogue from "../Dialogue/Dialogue";
import {Direction, Neo4jNode, RequestBodyConnection} from "../../../../shared/interfaces"
import {HOST} from "../../../../shared/variables"
import Node from '../Node/Node'
import CategoryComp from '../Category/CategoryComp'
import {updateCategoryUtil} from "../Categories.util";

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
            direction: Direction.AWAY
        }])
    }

    return (
        <Dialogue hideDialogue={hideDialogue} title={"Add connection path between two nodes"}>

            <Node>
                <div>
                    {startNodeName.replaceAll('_', ' ')}
                </div>
            </Node>

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
