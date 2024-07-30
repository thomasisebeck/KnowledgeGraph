import s from './App.module.scss'

import React, {useEffect, useReducer, useState} from 'react'

import MyNetwork from './components/MyNetwork.js'
import {createRelRequestBody, GraphNode, GraphType, NodeRelationship} from "../../shared/interfaces";
import AddBox from "./components/AddBox";

import {AddButtons} from "./components/AddButtons/AddButtons";
import {unstable_batchedUpdates} from "react-dom";
import {HoverImage} from "./components/HoverImage/HoverImage";

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

const HOST = "http://localhost:5000";

function App() {

    const [nodes, setNodes] = useState<GraphNode[]>()
    const [relationships, setRelationships] = useState<NodeRelationship[]>()
    const [addPhase, setAddPhase] = useState<AddConnectionPhase>(AddConnectionPhase.NONE)
    const [firstNode, setFirstNode] = useState<string | null>(null)
    const [secondNode, setSecondNode] = useState<string | null>(null)
    const [clickE, setClickE] = useState<clickEvent | null>(null)


    //fetch the initial data
    useEffect(() => {
        fetch(`${HOST}/topicNodes`).then(async res => {
            const data = await res.json() as GraphType;
            setNodes(data.nodes)
            setRelationships(data.relationships)
            setAddPhase(AddConnectionPhase.NONE)
        })
    }, []);

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

            //rel
            if (clickE.clickType == clickType.EDGE) {
                //todo: show upvote buttons



            }

        }
    }, [clickE])

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

    function resetSelectedNodes() {
        setFirstNode(null)
        setSecondNode(null)
    }

    const createConn = () => {
        resetSelectedNodes();
        setAddPhase(AddConnectionPhase.FIRST)
    }

    const reset = () => {
        setAddPhase(AddConnectionPhase.NONE)
        resetSelectedNodes();
    }

    function updateRelationship(myRel1: NodeRelationship) {
        console.log("returned relationship")
        console.log(myRel1)

        unstable_batchedUpdates(() => {

            //update the relationships using the prev state
            setRelationships(prevState => {
                if (prevState) {
                    const newRels = prevState;

                    //todo: handle double sided connections
                    let found = false;

                    for (const rel of newRels) {
                        if (rel.relId == myRel1.relId) {
                            rel.votes = myRel1.votes;
                            found = true;
                            console.log("UPDATED VOTES ON" + rel.relId + " TO " + rel.votes)
                        }
                    }

                    if (found)
                        //would be double-sided already
                        return [...newRels];

                    console.log("ADDING NEW REL")
                    return [myRel1, ...newRels]
                }
            });

            reset();
        })
    }

    const sendCreateConnApi = async (name: string, doubleSided: boolean) => {
        if (firstNode == null || secondNode == null) {
            console.log("First or second is null")
            reset();
            return;
        }

        const body: createRelRequestBody = {
            name: name,
            toId: secondNode,
            fromId: firstNode,
            doubleSided: doubleSided
        }

        console.log(body);

        await fetch(`${HOST}/createRel`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(async res => {
                if (res.status == 400) {
                    console.error(res.text())
                }
                if (res.status == 200) {
                    const body = await res.json();

                    //todo: see the format of a double-sided rel
                    console.log("BODY")
                    console.log(body)

                    //get the response for the updated relationship
                    const myRel1 = body as NodeRelationship;
                    updateRelationship(myRel1);

                    return;

                }

                console.error("error")
                console.error(res.status)
                reset();
            })


    }

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
            console.log(result)

            const relationship = result.rel as NodeRelationship;
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

            <div className={s.CreateConnectionContainer}>
                {addPhase}
                {addPhase == AddConnectionPhase.FIRST && <p>Click on first node</p>}
                {addPhase == AddConnectionPhase.SECOND && <p>Click on second node</p>}
            </div>

            <div className={s.plus}>
                <AddButtons showAddBox={() => createConn()}/>
            </div>

            {
                addPhase == AddConnectionPhase.ADD_BOX &&
                <AddBox
                    hideAddBox={() => {
                        setAddPhase(AddConnectionPhase.NONE)
                        setFirstNode(null)
                        setSecondNode(null)
                    }}
                    createConnection={sendCreateConnApi}
                />
            }

            {
                <div className={s.upvoteDownvoteContainer}>
                    <HoverImage
                        message={"upvote edge"}
                        normalImage={"buttons/upvote.svg"}
                        hoverImage={"buttons/upvote hover.svg"}
                        onclick={async () => {
                            if (clickE && clickE.clickType == clickType.EDGE)
                                await upvoteEdge(clickE.id, true).then(r => console.log(r))
                        }}
                    />
                    <HoverImage
                        message={"downvote edge"}
                        normalImage={"buttons/downvote.svg"}
                        hoverImage={"buttons/downvote hover.svg"}
                        onclick={async () => {
                            if (clickE && clickE.clickType == clickType.EDGE)
                                await upvoteEdge(clickE.id, false).then(r => console.log(r))
                        }}
                    />

                </div>
            }
        </div>
    )
}

export default App
