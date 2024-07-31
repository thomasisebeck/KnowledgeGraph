import React, {useEffect, useState} from 'react'
import MyNetwork from './components/MyNetwork/MyNetwork.js'
import {GraphNode, NodeRelationship} from "../../shared/interfaces";
import AddConnectionDialogue from "./components/AddConnectionDialogue";
import {AddButtons} from "./components/AddButtons/AddButtons";
import {HoverImage} from "./components/HoverImage/HoverImage";
import AddStackDialogue from "./components/AddStackDialogue/AddStackDialogue";
import {AddConnectionPhase, clickEvent, ClickType} from "./interfaces";
import {HOST} from "../../shared/variables"
import s from './App.module.scss'

function upvoteDownvoteButtons(clickE: clickEvent | null, upvoteEdge: (edgeId: string, mustUpvote: boolean) => Promise<void>) {
    return <div className={s.upvoteDownvoteContainer}>
        <HoverImage
            message={"upvote edge"}
            normalImage={"buttons/upvote.svg"}
            hoverImage={"buttons/upvote-hover.svg"}
            onclick={async () => {
                //upvote the edge
                if (clickE && clickE.clickType == ClickType.EDGE)
                    await upvoteEdge(clickE.id, true).then(r => console.log(r))
            }}
        />
        <HoverImage
            message={"downvote edge"}
            normalImage={"buttons/downvote.svg"}
            hoverImage={"buttons/downvote-hover.svg"}
            onclick={async () => {
                //downvote the edge
                if (clickE && clickE.clickType == ClickType.EDGE)
                    await upvoteEdge(clickE.id, false).then(r => console.log(r))
            }}
        />

    </div>;
}

function App() {

    const [nodes, setNodes] = useState<GraphNode[]>()
    const [relationships, setRelationships] = useState<NodeRelationship[]>()
    const [addPhase, setAddPhase] = useState<AddConnectionPhase>(AddConnectionPhase.NONE)
    const [firstNode, setFirstNode] = useState<string | null>(null)
    const [secondNode, setSecondNode] = useState<string | null>(null)
    const [clickEvent, setClickEvent] = useState<clickEvent | null>(null)
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

        if (clickEvent != null) {

            //node
            if (clickEvent.clickType == ClickType.NODE) {
                //click first node
                if (addPhase == AddConnectionPhase.FIRST) {
                    setFirstNode(clickEvent.id)
                    setAddPhase(AddConnectionPhase.SECOND)
                }

                //click second node
                if (addPhase == AddConnectionPhase.SECOND) {
                    console.log("SECOND")
                    if (clickEvent.id !== firstNode) {
                        setSecondNode(clickEvent.id)
                        setAddPhase(AddConnectionPhase.ADD_BOX)
                    }
                }
            }

        }
    }, [clickEvent])

    //handle clicks for nodes and edges
    const handleClickEvent = (event: any) => {

        //has nodes, set node event on click
        if (event.nodes.length > 0) {
            console.log("SETTING NODE")
            setClickEvent({
                clickType: ClickType.NODE,
                id: event.nodes[0]
            })
            return;
        }

        //has edges, set edge event on click
        if (event.edges.length > 0) {
            console.log("SETTING EDGE")
            setClickEvent({
                clickType: ClickType.EDGE,
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

        //update the relationships using the prev state
        setRelationships(prevState => {
            if (prevState) {
                //get the index of the existing rel
                const existingIndex = prevState.findIndex(rel => rel.relId === myRel1.relId);

                if (existingIndex !== -1) {
                    //found existing rel, update and return
                    const toUpdate = [...prevState];
                    toUpdate[existingIndex] = {...toUpdate[existingIndex], votes: myRel1.votes}
                    return toUpdate;
                }

                //not found, insert the new rel
                return [myRel1, ...prevState]
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
                    clickEvent={handleClickEvent}
                />
            }

            {/*dialogue when creating a connection*/}
            <div className={s.CreateConnectionContainer}>
                {addPhase == AddConnectionPhase.FIRST && <p>Click on first node</p>}
                {addPhase == AddConnectionPhase.SECOND && <p>Click on second node</p>}
            </div>

            {/*buttons to add relationships and nodes*/}
            <div className={s.plus}>
                <AddButtons
                    showAddBox={() => createConn()}
                    showAddStack={() => setShowAddStackDialogue(true)}
                />
            </div>

            {/* when the add connection phase requires the dialogue to be shown, */}
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

            {/*dialogue to add a new connection stack*/}
            {
                showAddStackDialogue &&
                <AddStackDialogue
                    hideAddStackDialogue={() => setShowAddStackDialogue(false)}
                />
            }

            {/*buttons to upvote and downvote relationships*/}
            {upvoteDownvoteButtons(clickEvent, upvoteEdge)}
        </div>
    )
}

export default App
