import React, {useEffect, useState} from 'react'
import MyNetwork from './components/MyNetwork/MyNetwork.js'
import {
    CreateStackReturnBody,
    Direction,
    FrontendBaseCateogries,
    Node,
    NodeRelationship,
    UpvoteResult
} from "../../shared/interfaces";
import AddConnectionDialogue from "./components/AddConnectionDialogue";
import {AddButtons} from "./components/AddButtons/AddButtons";
import {HoverImage} from "./components/HoverImage/HoverImage";
import AddStackDialogue from "./components/AddStackDialogue/AddStackDialogue";
import {AddPhase, Phase} from "./interfaces";
import {HOST} from "../../shared/variables"
import s from './App.module.scss'

function upvoteDownvoteButtons(selectedEdgeId: string, upvoteEdge: (edgeId: string, mustUpvote: boolean) => Promise<void>) {
    return <div className={s.upvoteDownvoteContainer}>
        <HoverImage
            message={"upvote edge"}
            normalImage={"buttons/upvote.svg"}
            hoverImage={"buttons/upvote-hover.svg"}
            onclick={async () => {
                //upvote the edge
                await upvoteEdge(selectedEdgeId, true)
            }}
        />
        <HoverImage
            message={"downvote edge"}
            normalImage={"buttons/downvote.svg"}
            hoverImage={"buttons/downvote-hover.svg"}
            onclick={async () => {
                //downvote the edge
                await upvoteEdge(selectedEdgeId, false)
            }}
        />

    </div>;
}


function App() {

    const [nodes, setNodes] = useState<Node[]>([])
    const [relationships, setRelationships] = useState<NodeRelationship[]>([])
    const [addPhase, setAddPhase] = useState<AddPhase>({
        phase: Phase.NONE,
        secondNodeId: "",
        firstNodeId: ""
    })
    // const [firstNode, setFirstNode] = useState<string | null>(null)
    // const [secondNode, setSecondNode] = useState<string | null>(null)
    // const [clickEvent, setClickEvent] = useState<clickEvent | null>(null)
    const [showAddStackDialogue, setShowAddStackDialogue] = useState<boolean>(false)
    const [stackLoading, setStackLoading] = useState<boolean>(false)
    const [baseCategories, setBaseCategories] = useState<FrontendBaseCateogries[]>([])
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    //add a node when clicking on a snippet to show the information
    const expandNode = async (newNode: any) => {

        //expand the snippet of an info node
        if (newNode.snippet) {

            console.log("ADDING NODE")
            console.log(newNode.snippet)

            //create new id's so as not to conflict
            const INFO_ID = newNode.nodeId + "-info";
            const REL_ID = newNode.nodeId + "-rel";

            //check that no duplicates are added
            for (const n of nodes) {
                if (n.nodeId == INFO_ID)
                    return;
            }

            //add the node
            setNodes([
                {
                    nodeId: INFO_ID,
                    label: newNode.label,
                    snippet: newNode.snippet,
                    nodeType: "INFO",
                    isSnippetNode: true
                }, ...nodes])

            //add rel
            setRelationships([{
                direction: Direction.AWAY,
                votes: 5,
                relId: REL_ID,
                from: newNode.nodeId,
                to: INFO_ID,
                type: ""
            }, ...relationships])

            return;
        }

        //expand a classification node
        const DEPTH = 2;

        if (newNode.nodeId != null && newNode.nodeType !== "INFO") {

            // console.log(`${counter++} CALLING EXPAND ON CLASSIFICATION NODE, ID: ${newNode.nodeId}`);

            const neighborhood = await fetch(`${HOST}/neighborhood/${newNode.nodeId}/${DEPTH}`)
                .then(async result => {
                    return await result.json();
                })

            console.log("adding neighborhood to frontend...")
            console.log("adding nodes...")
            const newNodes = nodes;

            for (const node of neighborhood.nodes) {
                const index = newNodes.findIndex((n) => n.nodeId == node.nodeId);
                if (index == -1)
                    newNodes.push(node);
            }

            const newRels = relationships;
            for (const rel of neighborhood.relationships) {
                const index = newRels.findIndex((r) => r.relId == rel.relId);
                if (index == -1)
                    newRels.push(rel);
            }

            console.log("setting...")
            setNodes([...newNodes])
            setRelationships([...newRels])
        }
    }

    function getData() {
        fetch(`${HOST}/initialData`).then(async res => {
            const data = await res.json();
            console.log("FRONTEND INIT DATA")
            console.log(data)

            const nodes = data.topicNodes as Node[];

            //set the categories for the dropdown menu
            setBaseCategories(nodes.map((n: Node) => {
                return {
                    nodeId: n.nodeId,
                    label: n.label.replaceAll('_', ' ')
                }
            }));

            //add nodes to frontend
            setNodes(nodes.map((n: Node) => {
                return {
                    nodeId: n.nodeId,
                    label: n.label,
                    snippet: undefined,
                    isSnippetNode: false,
                    nodeType: n.nodeType
                }
            }));

            console.log("NODES SET")

        }).catch(e => {
            console.error(e)
        })
    }

//fetch the initial data and preload images
    useEffect(() => {
        //fetch data
        getData();

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
    //
    // const tryUpvoteEdge = async () => {
    //     if (clickEvent != null) {
    //         if (clickEvent.clickType == ClickType.EDGE) {
    //             await upvoteEdge(clickEvent.id, true)
    //         }
    //     }
    // }
    //
    // const tryDownvoteEdge = async () => {
    //     if (clickEvent != null) {
    //         if (clickEvent.clickType == ClickType.EDGE) {
    //             await upvoteEdge(clickEvent.id, false)
    //         }
    //     }
    // }

    //handle selecting edges
    useEffect(() => {
        if (selectedEdgeId != null) {
            console.log("handling select edge with id: " + selectedEdgeId)
        }
    }, [selectedEdgeId]);

    useEffect(() => {
        if (selectedNodeId != null) {
            //click first node
            if (addPhase.phase == Phase.FIRST) {
                console.log("clicked first node, id: " + selectedNodeId)
                setAddPhase({
                    ...addPhase,
                    phase: Phase.SECOND,
                    firstNodeId: selectedNodeId
                })
                return;
            }

            if (addPhase.phase == Phase.SECOND) {
                console.log("clicked second node, id: " + selectedNodeId)
                setAddPhase({
                    ...addPhase,
                    phase: Phase.ADD_BOX,
                    secondNodeId: selectedNodeId
                })
                return;
            }

            //handle expanding nodes
            if (nodes) {
                for (const node of nodes)
                    if (node.nodeId == selectedNodeId && node.nodeType != "INFO") {
                        expandNode(node)
                        return;
                    }
            }
        }
    }, [selectedNodeId]);

    //register clicks for nodes and edges
    // useEffect(() => {
    //     // if (clickEvent && (addPhase == AddConnectionPhase.FIRST || addPhase == AddConnectionPhase.SECOND))
    //     //     handleClickingNodesToConnectWhenAddingEdge();
    //
    //     if (clickEvent?.clickType == ClickType.NODE) {
    //         handleSelectNode(clickEvent.id);
    //     }
    //
    //     if (clickEvent?.clickType == ClickType.EDGE) {
    //         handleSelectEdge(clickEvent.id);
    //     }
    // }, [clickEvent])
    //
    // handle clicks for nodes and edges
    /*   const handleClickEvent = (event: any) => {

          //has nodes, set node event on click
          if (event.nodes.length > 0) {

              console.log(event);

              console.log("HAS NODES")

              //todo: prevent clicking on info node
              setClickEvent({
                  clickType: ClickType.NODE,
                  id: event.nodes[0]
              })

              const mouseX = event.pointer.DOM.x;
              const mouseY = event.pointer.DOM.y;

              console.log("MOUSE")
              console.log(mouseX)
              console.log(mouseY)

              setShowPopup({
                  mouseY: mouseY,
                  mouseX: mouseX
              })

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
      }*/

    /*

    if (clickEvent && clickEvent.clickType == ClickType.NODE) {

            //click first node
            if (addPhase == AddConnectionPhase.FIRST) {
                console.log("MY NODE")
                console.log(clickEvent);
                console.log(clickEvent.node)
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
     */

    // const handleSelectNode = async (nodeId: string) => {
    //
    // }

    // useEffect(() => {
    //     console.log("handling select node with id: " + nodeId)
    //     console.log(addPhase)
    //
    //     //see if you are adding a connection
    //     if (addPhase != AddConnectionPhase.NONE) {
    //         console.log("currently adding a connection")
    //
    //         //click first node
    //         if (addPhase == AddConnectionPhase.FIRST) {
    //             console.log("MY NODE")
    //             setFirstNode(nodeId)
    //             setAddPhase(AddConnectionPhase.SECOND)
    //         }
    //
    //         //click second node
    //         if (addPhase == AddConnectionPhase.SECOND) {
    //             setSecondNode(nodeId)
    //             setAddPhase(AddConnectionPhase.ADD_BOX)
    //         }
    //
    //         return;
    //     }
    //
    //
    //     if (nodes) {
    //         for (const node of nodes)
    //             if (node.nodeId == nodeId && node.nodeType != INFO) {
    //                 const res = await expandNode(node)
    //             }
    //     }
    // }, [addPhase]);


    //start adding a connection, show the dialogue to click on the first node
    // const createConn = () => {
    // }

    const addStackToFrontend = (body: CreateStackReturnBody) => {
        const requestNodes = body.nodes as Node[];
        const requestRelationships = body.relationships;

        console.log("nodes")
        console.log(nodes)

        console.log("rels")
        console.log(requestRelationships)

        for (const n of requestNodes)
            updateNode(n)

        //update or add rel
        for (const r of requestRelationships)
            updateRelationship(r);

        setShowAddStackDialogue(false);
        setStackLoading(false);

    }

    function updateNode(toAdd: Node) {
        console.log("TO ADD")
        console.log(toAdd)

        if (toAdd == null) {
            console.error("Node is null")
            return;
        }

        setNodes(prevState => {
            const existingIndex = prevState.findIndex(node => node.nodeId == toAdd.nodeId);
            if (existingIndex !== -1)  //node already added
                return prevState; //return old state

            if (toAdd.snippet != undefined)
                console.log("ADDING NODE WITH SNIPPET")

            //not found, insert new node
            return [...prevState, toAdd];
        })

    }

    //used to update the relationship in the state after it's changed
    function updateRelationship(result: NodeRelationship) {

        if (result == null) {
            console.error("REL IS NULL!!!!")
            return;
        }

        //update the relationships using the prev state
        setRelationships(prevState => {
            const existingIndex = prevState.findIndex(rel => rel.relId === result.relId);

            if (existingIndex !== -1) {
                const toUpdate = [...prevState];
                toUpdate[existingIndex] = {...toUpdate[existingIndex], votes: result.votes}
                return toUpdate;
            }

            //not found, insert the new rel
            return [result, ...prevState]
        });
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

            if (relationship.newRelId != null) { //rel kept alive, add back
                console.log("Rel kept alive... adding back")
                console.log("set votes to 5 and update relID")
                setRelationships(prevState =>
                    prevState?.map(rel => {
                        if (rel.relId === relationship.relId) {
                            console.log("new rel REL")
                            console.log(rel)

                            //allow continual upvote
                            setSelectedEdgeId(relationship.newRelId!)

                            console.log("returning new rel with relID" + relationship.relId);
                            return {
                                ...rel,
                                relId: relationship.newRelId!,
                                votes: relationship.votes
                            }
                        }
                        return rel;
                    })
                );

                //nothing more to do after adding back
                return;
            }

            //find and update the relationships, remove ones with 0 votes
            setRelationships(prevState =>
                prevState?.map(rel => {
                    if (rel.relId === relationship.relId) {
                        return {
                            ...rel,
                            votes: relationship.votes
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
                nodes.length > 0 &&
                <MyNetwork
                    nodes={nodes}
                    relationships={relationships}
                    setSelectedNodeId={setSelectedNodeId}
                    setSelectedEdgeId={setSelectedEdgeId}
                />
            }

            {/*dialogue when creating a connection*/}
            <div className={s.CreateConnectionContainer}>
                {addPhase.phase == Phase.FIRST && <p>Click on first node</p>}
                {addPhase.phase == Phase.SECOND && <p>Click on second node</p>}
            </div>

            {/*buttons to add relationships and nodes*/}
            <div className={s.plus}>
                <AddButtons
                    showAddBox={() => setAddPhase({
                        ...addPhase,
                        phase: Phase.FIRST
                    })}
                    showAddStack={() => setShowAddStackDialogue(true)}
                />
            </div>

            {/* when the add connection phase requires the dialogue to be shown, */}
            {
                addPhase.phase == Phase.ADD_BOX &&
                <AddConnectionDialogue
                    firstNode={addPhase.firstNodeId}
                    hideAddBox={() => setAddPhase({
                        ...addPhase,
                        phase: Phase.NONE
                    })
                    }
                    secondNode={addPhase.secondNodeId}
                    reset={() => setAddPhase({
                        ...addPhase,
                        phase: Phase.NONE
                    })}
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
            {
                selectedEdgeId != null &&
                upvoteDownvoteButtons(selectedEdgeId, upvoteEdge)
            }
        </div>
    )
}

export default App
