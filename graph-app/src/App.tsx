import React, {useEffect, useState} from 'react'
import MyNetwork from './components/MyNetwork/MyNetwork.js'
import {
    GraphNode,
    NodeRelationship,
    UpvoteResult,
    CreateStackReturnBody,
    nodeType,
    FrontendBaseCateogries,
    Node
} from "../../shared/interfaces";
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
    const [stackLoading, setStackLoading] = useState<boolean>(false)
    const [baseCategories, setBaseCategories] = useState<FrontendBaseCateogries[]>([])

    //fetch the initial data and preload images
    useEffect(() => {
        //fetch data
        fetch(`${HOST}/initialData`).then(async res => {
            const data = await res.json();
            console.log("FRONTEND INIT DATA")
            console.log(data)

            //set the categories for the dropdown menu
            setBaseCategories(data.topicNodes.map((n: Node) => {
                return {
                    nodeId: n.nodeId,
                    label: n.label
                }
            }));

            const myNodes: GraphNode[] = data.nodes.map((n: Node) => {
                if (n.nodeType == "ROOT")
                    return {
                        ...n,
                        nodeType: nodeType.ROOT
                    }
                if (n.nodeType == "CLASS")
                    return {
                        ...n,
                        nodeType: nodeType.CLASSIFICATION
                    }
                return {
                    ...n,
                    nodeType: nodeType.INFORMATION
                }
            })

            const myRels: NodeRelationship[] = data.relationships;

            setNodes([...myNodes])
            setRelationships([...myRels])
            setAddPhase(AddConnectionPhase.NONE)
        }).catch(e => {
            console.error(e)
        })

        const images = [
            "add-category-node.svg",
            "add-category-node-hover.svg",
            "add-connection.svg",
            "add-connection-hover.svg",
            "add-node.svg",
            "add-node-hover.svg",
            "cancel.svg",
            "down-arrow.svg",
            "downvote.svg",
            "downvote-hover.svg",
            "exit.svg",
            "exit-hover.svg",
            "neutral.svg",
            "plus.svg",
            "plus-hover.svg",
            "up-arrow.svg",
            "upvote.svg",
            "upvote-hover.svg",
        ]

        images.forEach(img => {
            const image = new Image();
            image.src = "buttons/" + img;
        })

    }, []);

    const handleClickingNodesToConnectWhenAddingEdge = () => {
        if (addPhase == AddConnectionPhase.FIRST || addPhase == AddConnectionPhase.SECOND)
            if (clickEvent && clickEvent.clickType == ClickType.NODE) {

                //click first node
                if (addPhase == AddConnectionPhase.FIRST) {
                    setFirstNode(clickEvent.id)
                    setAddPhase(AddConnectionPhase.SECOND)
                }

                //click second node
                if (addPhase == AddConnectionPhase.SECOND) {
                    if (clickEvent.id !== firstNode) {
                        setSecondNode(clickEvent.id)
                        setAddPhase(AddConnectionPhase.ADD_BOX)
                    }
                }
            }
    }

    //register clicks for nodes and edges
    useEffect(() => {
        if (clickEvent != null) {

            console.log("CLICK EVENT FIRED")

            //in process of adding an edge
            handleClickingNodesToConnectWhenAddingEdge();

            //want to upvote or downvote edge
            // handleClickingEdgesForVoting();

        }
    }, [clickEvent])

    //handle clicks for nodes and edges
    const handleClickEvent = (event: any) => {

        //has nodes, set node event on click
        if (event.nodes.length > 0) {
            setClickEvent({
                clickType: ClickType.NODE,
                id: event.nodes[0]
            })
            handleClickingNodesToConnectWhenAddingEdge()
            return;
        }

        //has edges, set edge event on click
        if (event.edges.length > 0) {
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

    const addStackToFrontend = (body: CreateStackReturnBody) => {
        console.log("App.ts: Add stack to frontend")
        const nodes = body.nodes;
        const rels = body.relationships;


        //todo: hide the dialogue
        //todo: make loading button

        setTimeout(() => {
            setShowAddStackDialogue(false);
            setStackLoading(false);
        }, 2000)

    }

    //reset the state
    const reset = () => {
        setAddPhase(AddConnectionPhase.NONE)
        setFirstNode(null)
        setSecondNode(null)
    }

    //used to update the relationship in the state after it's changed
    function updateRelationship(result: NodeRelationship) {

        if (result == null) {
            console.error("REL IS NULL!!!!")
            return;
        }

        //update the relationships using the prev state
        setRelationships(prevState => {
            if (prevState) {
                //get the index of the existing rel
                const existingIndex = prevState.findIndex(rel => rel.relId === result.relId);

                if (existingIndex !== -1) {
                    //found existing rel, update and return
                    const toUpdate = [...prevState];
                    toUpdate[existingIndex] = {...toUpdate[existingIndex], votes: result.votes}
                    return toUpdate;
                }

                //not found, insert the new rel
                return [result, ...prevState]
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

            const relationship = result as UpvoteResult;

            console.log("RESULT AFTER UPVOTE: ")
            console.log(relationship)

            //find and update the relationships (only in current vasinity)
            setRelationships(prevState =>
                prevState?.map(rel => {
                    if (rel.relId == result.relId) {
                        return {
                            ...rel,
                            votes: result.votes
                        }
                    }
                    return rel;
                })
                    //filter out deleted relationships
                    .filter(rel => rel.votes > 0)
            );
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
                    addStackToFrontend={addStackToFrontend}
                    isLoading={stackLoading}
                    setStackLoading={setStackLoading}
                    baseCategories={baseCategories}
                />
            }

            {/*buttons to upvote and downvote relationships*/}
            {upvoteDownvoteButtons(clickEvent, upvoteEdge)}
        </div>
    )
}

export default App
