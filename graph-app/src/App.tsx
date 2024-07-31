import s from './App.module.scss'

import React, {useEffect, useReducer, useState} from 'react'

import MyNetwork from './components/MyNetwork/MyNetwork.js'
import {GraphNode, GraphType, NodeRelationship} from "../../shared/interfaces";
import {HOST} from "../../shared/variables"
import AddConnectionDialogue from "./components/AddConnectionDialogue";

import {AddButtons} from "./components/AddButtons/AddButtons";
import {HoverImage} from "./components/HoverImage/HoverImage";
import AddStackDialogue from "./components/AddStackDialogue";

enum AddConnectionPhase {
    NONE,
    FIRST,
    SECOND,
    ADD_BOX
}

enum clickType {
    NODE,
    EDGE
}

interface clickEvent {
    clickType: clickType,
    id: string
}

function App() {

    const [nodes, setNodes] = useState<GraphNode[]>()
    const [relationships, setRelationships] = useState<NodeRelationship[]>()
    const [addPhase, setAddPhase] = useState<AddConnectionPhase>(AddConnectionPhase.NONE)
    const [firstNode, setFirstNode] = useState<string | null>(null)
    const [secondNode, setSecondNode] = useState<string | null>(null)
    const [clickE, setClickE] = useState<clickEvent | null>(null)
    const [showAddStackDialogue, setShowAddStackDialogue] = useState<boolean>(false)

    //fetch the initial data
    useEffect(() => {
        fetch(`${HOST}/initialData`).then(async res => {
            const data = await res.json();
            console.log("FRONTEND INIT DATA")
            console.log(data)
            setNodes(data.nodes as GraphNode[])
            setRelationships(data.relationships as NodeRelationship[])
            setAddPhase(AddConnectionPhase.NONE)
        })
    }, []);

    //register clicks for nodes and edges
    useEffect(() => {
        console.log("CLICKED")

        if (clickE != null) {

            //node
            if (clickE.clickType == clickType.NODE) {
                //click first node
                if (addPhase == AddConnectionPhase.FIRST) {
                    setFirstNode(clickE.id)
                    setAddPhase(AddConnectionPhase.SECOND)
                }

                //click second node
                if (addPhase == AddConnectionPhase.SECOND) {
                    console.log("SECOND")
                    if (clickE.id !== firstNode) {
                        setSecondNode(clickE.id)
                        setAddPhase(AddConnectionPhase.ADD_BOX)
                    }
                }
            }

        }
    }, [clickE])

    //handle clicks for nodes and edges
    const clickEvent = (event: any) => {

        //has nodes, set node event on click
        if (event.nodes.length > 0) {
            console.log("SETTING NODE")
            setClickE({
                clickType: clickType.NODE,
                id: event.nodes[0]
            })
            return;
        }

        //has edges, set edge event on click
        if (event.edges.length > 0) {
            console.log("SETTING EDGE")
            setClickE({
                clickType: clickType.EDGE,
                id: event.edges[0]
            })

            return;
        }
    }

    //start adding a connection, show the dialogue to click on the first node
    const createConn = () => {
        reset();
        setAddPhase(AddConnectionPhase.FIRST)
    }

    //reset the state
    const reset = () => {
        setAddPhase(AddConnectionPhase.NONE)
        setFirstNode(null)
        setSecondNode(null)
    }

    //used to update the relationship in the state after it's changed
    function updateRelationship(myRel1: NodeRelationship) {
        console.log("returned relationship")
        console.log(myRel1)

        //update the relationships using the prev state
        setRelationships(prevState => {
            if (prevState) {

                //store the previous state for update
                const newRels = prevState;

                let found = false;

                for (const rel of newRels) {
                    if (rel.relId == myRel1.relId) {
                        rel.votes = myRel1.votes;
                        found = true;
                        console.log("UPDATED VOTES ON" + rel.relId + " TO " + rel.votes)
                    }
                }

                //found relationship, return the updated version as an array to replace the state
                if (found)
                    return [...newRels];

                //relationship not found, add it to the list of relationships in the state
                return [myRel1, ...newRels]
            }
        });

        reset();
    }

    //make an api request to upvote a relationship
    const upvoteEdge = async (edgeId: string, mustUpvote: boolean) => {
        const URL = mustUpvote ? `${HOST}/upvoteRel` : `${HOST}/downvoteRel`;

        await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                relId: edgeId
            })
        }).then(async res => {
            const result = await res.json();
            const relationship = result.rel as NodeRelationship;

            //check if removed
            if (!mustUpvote && relationship.votes < 0) {
                console.log("TRYING TO DELETE")
                setRelationships(prevState => prevState?.filter(rel => rel.relId !== relationship.relId))
                //early return in must remove
                return;
            }

            //update the relationship on the existing graph
            updateRelationship(relationship);
        })

    }

    return (
        <div className={s.Container}>
            {
                nodes && relationships &&
                <MyNetwork
                    nodes={nodes}
                    relationships={relationships}
                    clickEvent={clickEvent}
                />
            }

            {/*dialogue when creating a connection*/}
            <div className={s.CreateConnectionContainer}>
                {addPhase == AddConnectionPhase.FIRST && <p>Click on first node</p>}
                {addPhase == AddConnectionPhase.SECOND && <p>Click on second node</p>}
            </div>

            {/*buttons to add relationships and nodes*/}
            <div className={s.plus}>
                <AddButtons showAddBox={() => createConn()} showAddStack={() => setShowAddStackDialogue(true)}/>
            </div>

            {/* when the add connection phase requires the dialogue to be shown, */}
            {/* then show the dialogue*/}
            {
                addPhase == AddConnectionPhase.ADD_BOX &&
                <AddConnectionDialogue
                    firstNode={firstNode}
                    hideAddBox={() => {
                        setAddPhase(AddConnectionPhase.NONE)
                        setFirstNode(null)
                        setSecondNode(null)
                    }}
                    secondNode={secondNode}
                    reset={reset}
                    updateRelationship={updateRelationship}
                />
            }

            {
                showAddStackDialogue &&
                <AddStackDialogue
                    hideAddStackDialogue={() => setShowAddStackDialogue(false)}
                />
            }

            {/*buttons to upvote and downvote relationships*/}
            <div className={s.upvoteDownvoteContainer}>
                <HoverImage
                    message={"upvote edge"}
                    normalImage={"buttons/upvote.svg"}
                    hoverImage={"buttons/upvote-hover.svg"}
                    onclick={async () => {
                        //upvote the edge
                        if (clickE && clickE.clickType == clickType.EDGE)
                            await upvoteEdge(clickE.id, true).then(r => console.log(r))
                    }}
                />
                <HoverImage
                    message={"downvote edge"}
                    normalImage={"buttons/downvote.svg"}
                    hoverImage={"buttons/downvote-hover.svg"}
                    onclick={async () => {
                        //downvote the edge
                        if (clickE && clickE.clickType == clickType.EDGE)
                            await upvoteEdge(clickE.id, false).then(r => console.log(r))
                    }}
                />

            </div>
        </div>
    )
}

export default App
