import React, {useEffect, useState} from 'react'
import Dialogue from "../Dialogue/Dialogue";
import {Direction, Neo4jNode, Category} from "../../../../shared/interfaces"
import {HOST} from "../../../../shared/variables"
import s from './AddCategoryDialogue.module.scss'
import Node from '../Node/Node'

interface AddCategoryDialogueProps {
    hideDialogue: () => void,
    firstNodeId: string,
    secondNodeId: string,
}

const getImageBasedOnDirection = (dir: Direction) => {
    switch (dir) {
        case Direction.NEUTRAL:
            return 'buttons/neutral.svg'
        case Direction.TOWARDS:
            return 'buttons/up-arrow.svg'
        case Direction.AWAY:
            return 'buttons/down-arrow.svg'
    }

}

const AddCategoryDialogue = ({hideDialogue, firstNodeId, secondNodeId}: AddCategoryDialogueProps) => {

    const [categories, setCategories] = useState<Category[]>([{
        categoryName: "new category",
        connectionDirection: Direction.NEUTRAL,
        connectionName: "connection name"
    }]);

    const [startNodeName, setStartNodeName] = useState<string>("");
    const [endNodeName, setEndNodeName] = useState<string>("");


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
        getNodes().then(result => {
            // console.log(result.firstNode);
            // console.log(result.secondNode);
        })
    }, []);

    function toggleDirection(index: number) {
        switch (categories[index]?.connectionDirection) {
            case Direction.NEUTRAL:
                categories[index].connectionDirection = Direction.AWAY;
                break;
            case Direction.AWAY:
                categories[index].connectionDirection = Direction.TOWARDS;
                break;
            case Direction.TOWARDS:
                categories[index].connectionDirection = Direction.NEUTRAL;
                break;
        }

        setCategories([...categories])
    }

    const addBlankCategory = () => {
        setCategories([...categories, {
            categoryName: "new category",
            connectionName: "new connection",
            connectionDirection: Direction.AWAY
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
                categories.map((c, index) => {
                    return (
                        <div className={s.connectionContainer}>
                            <Node>
                                <input type={"text"}
                                       onChange={(e) => {
                                           categories[index].connectionName = e.target.value;
                                           setCategories([...categories])
                                       }}
                                />
                            </Node>
                            <img
                                src={getImageBasedOnDirection(c.connectionDirection)}
                                onClick={() => toggleDirection(index)}
                            />
                            <div>
                                <input type={"text"}
                                       onChange={(e) => {
                                           categories[index].categoryName = e.target.value;
                                           setCategories([...categories])
                                       }}
                                />
                            </div>
                        </div>
                    )
                })
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
