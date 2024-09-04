import React, {useEffect, useState} from "react";
import MyNetwork from "./components/MyNetwork/MyNetwork.js";
import {
    CreateStackReturnBody,
    Direction,
    FrontendBaseCateogries,
    GraphNode,
    NodeRelationship,
    RequestBody,
    RequestBodyConnection,
    Task,
    UpvoteResult,
    VoteData
} from "../../shared/interfaces";
import AddConnectionDialogue from "./components/CustomDialogues/AddConnectionDialogue";
import {AddButtons} from "./components/AddButtons/AddButtons";
import AddStackDialogue from "./components/AddStackDialogue/AddStackDialogue";
import {AddPhase, Phase} from "./interfaces";
import {BASE_CATEGORY_INDEX, ERROR_MESSAGE_TIMEOUT, HOST} from "../../shared/variables";
import s from "./App.module.scss";
import {upvoteDownvoteButtons} from "./components/UpvoteDownvoteButtons";
import Tasks from "./components/Tasks/Tasks";
import AddCategoryDialogue from "./components/CustomDialogues/AddCategoryDialogue";
import CategoryComp from "./components/Category/CategoryComp";
import {UpdateType} from "./components/AddStackDialogue/DialogueUtils";
import {HoverImage} from "./components/HoverImage/HoverImage";
import Error from "./components/Error/Error";

function App() {

    //graph components
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [relationships, setRelationships] = useState<NodeRelationship[]>([]);
    const [mustReset, setMustReset] = useState(true)
    const [displayLabels, setDisplayLabels] = useState(true);

    //creating a stack
    const [stackLoading, setStackLoading] = useState<boolean>(false);

    //selecting edges and nodes
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [addPhase, setAddPhase] = useState<AddPhase>({
        phase: Phase.NONE,
        secondNodeId: "",
        firstNodeId: "",
    });
    const [addCategoryPhase, setAddCategoryPhase] = useState<AddPhase>({
        phase: Phase.NONE,
        secondNodeId: "",
        firstNodeId: "",
    });

    //loading and showing dialogues
    const [showAddStackDialogue, setShowAddStackDialogue] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    //show dropdown
    const [baseCategories, setBaseCategories] = useState<FrontendBaseCateogries[]>([]);

    //adding categories between nodes
    const [categories, setCategories] = useState<RequestBodyConnection[]>([
        {
            nodeName: "new category",
            direction: Direction.NEUTRAL,
            connectionName: "connection name",
        },
    ]);

    //creating an information node
    const [info, setInfo] = useState("");
    const [heading, setHeading] = useState("");
    const [baseCategory, setBaseCategory] = useState<RequestBodyConnection>({
        connectionName: "",
        nodeId: "",
        direction: Direction.NEUTRAL,
        nodeName: "",
    });

    //capture statistics
    const [statObject, setStatObject] = useState<Task>({
        expandedNodesPerClick: [],
        clicksTillInNeighborhood: 0,
        targetNodeId: "",
        question: "",
        answer: "",
        providedAnswer: "",
        totalTime: 0,
        totalClicks: 0,
        username: ""
    })

    const [upvotedEdges, setUpvotedEdges] = useState<string[]>([])
    const [downvotedEdges, setDownvotedEdges] = useState<string[]>([])

    //add a node when clicking on a snippet to show the information
    const expandNode = async (newNode: any) => {

        //expand the snippet of an info node
        if (newNode.snippet) {

            //create new id's so as not to conflict
            const INFO_ID = newNode.nodeId + "-info";
            const REL_ID = newNode.nodeId + "-rel";

            //check that no duplicates are added
            for (const n of nodes) {
                if (n.nodeId == INFO_ID) return;
            }

            //add the node
            setNodes([
                {
                    nodeId: INFO_ID,
                    label: newNode.label,
                    snippet: newNode.snippet,
                    nodeType: "INFO",
                },
                ...nodes,
            ]);

            //add rel
            setRelationships([
                {
                    direction: Direction.AWAY,
                    votes: 5,
                    relId: REL_ID,
                    from: newNode.nodeId,
                    to: INFO_ID,
                    type: "",
                },
                ...relationships,
            ]);

            return;
        }

        //expand a classification node
        const DEPTH = 2;

        //expand the node
        const nodesCopy = nodes

        //set node white for initial expansion
        setNodes([...nodesCopy])


        if (newNode.nodeId != null && newNode.nodeType !== "INFO") {

            console.log("getting neighborhood")
            let success = true;

            const neighborhood = await fetch(
                `${HOST}/neighborhood/${newNode.nodeId}/${DEPTH}`,
            ).then(async (res) => {

                if (!res.ok) {
                    setErrorMessage(res.statusText);
                    setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT)
                    return;
                }

                return await res.json();
            }).catch((e) => {
                setErrorMessage(e.toString())
                setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT)
                success = false;
            })

            if (!success)
                return;

            //use the copy to keep the white node
            const newNodes = nodesCopy;

            let currExpandedNodes = 0;

            let hasFound = false;

            for (const node of neighborhood.nodes) {
                const index = newNodes.findIndex(
                    (n) => n.nodeId == node.nodeId,
                );
                if (index == -1) {
                    //add each node not found in the current nodes
                    newNodes.push(node);
                    currExpandedNodes++;

                    //check if the target node is now in the neighborhood
                    //check if it hasn't been set yet
                    console.log("node id: ", node.nodeId)
                    console.log("target id: ", statObject.targetNodeId)
                    console.log("stat object: ", statObject.clicksTillInNeighborhood)
                    console.log("setting to: ", statObject.totalClicks)

                    if (node.nodeId == statObject.targetNodeId && statObject.clicksTillInNeighborhood == 0) {
                        console.warn("set current clicks to in neighborhood")
                        hasFound = true;
                    }
                }
            }

            const newRels = relationships;
            for (const rel of neighborhood.relationships) {
                const index = newRels.findIndex((r) => r.relId == rel.relId);
                if (index == -1) newRels.push(rel);
            }

            //set the nodes, taking into account the expanded node
            setNodes(newNodes.map(n => {
                if (n.nodeId == newNode.nodeId) {
                    return {
                        ...n,
                        isExpanded: true
                    }
                }
                return n;
            }));

            setRelationships([...newRels]);

            //add the current expanded nodes to the object
            if (hasFound)
                setStatObject({
                    ...statObject,
                    totalClicks: statObject.totalClicks + 1,
                    clicksTillInNeighborhood: statObject.totalClicks + 1,
                    expandedNodesPerClick: [...statObject.expandedNodesPerClick, currExpandedNodes]
                })
            else
                setStatObject({
                    ...statObject,
                    totalClicks: statObject.totalClicks + 1,
                    expandedNodesPerClick: [...statObject.expandedNodesPerClick, currExpandedNodes]
                })
        }

    };

    //initial data from database
    function getData(username: string) {
        fetch(`${HOST}/initialData/${username}`)
            .then(async (res) => {

                if (!res.ok) {
                    console.error(res.status)
                    setErrorMessage("Failed to get initial data")
                    setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT)
                    return;
                }

                const data = await res.json();

                const nodes = data.topicNodes as GraphNode[];
                const voteData = data.voteData as VoteData;

                console.log("vote data:")
                console.log(voteData)

                setUpvotedEdges([...voteData.upvotedEdges])
                setDownvotedEdges([...voteData.downvotedEdges])

                //set the categories for the dropdown menu
                setBaseCategories(
                    nodes.map((n: GraphNode) => {
                        return {
                            nodeId: n.nodeId,
                            label: n.label.replaceAll("_", " "),
                        };
                    }),
                );

                //add nodes to frontend
                setNodes(
                    nodes.map((n: GraphNode) => {
                        return {
                            nodeId: n.nodeId,
                            label: n.label,
                            snippet: undefined,
                            isSnippetNode: false,
                            nodeType: n.nodeType,
                        };
                    }),
                );

                //after the graph has settled, allow the layout to be reset again
                setTimeout(() => {
                    setMustReset(false)
                }, 10)

            })
            .catch((e) => {
                setErrorMessage(e.toString())
                setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT)
            });
    }

    //fetch the initial data and preload images
    useEffect(() => {
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
            "reset.svg",
            "reset-hover.svg",
            "up-arrow.svg",
            "upvote.svg",
            "upvote-hover.svg",
        ];

        images.forEach((img) => {
            const image = new Image();
            image.src = "buttons/" + img;
        });
    }, []);

    //handle selecting edges
    useEffect(() => {
        if (selectedEdgeId != null) {
            console.log("handling select edge with id: " + selectedEdgeId);
        }
    }, [selectedEdgeId]);

    //handle selecting nodes
    useEffect(() => {
        if (selectedNodeId != null) {
            // -------------------------- add connection --------------------------- //

            //click first node for adding connection
            if (addPhase.phase == Phase.FIRST) {
                console.log("clicked first node, id: " + selectedNodeId);
                setAddPhase({
                    ...addPhase,
                    phase: Phase.SECOND,
                    firstNodeId: selectedNodeId,
                });
                return;
            }

            if (addPhase.phase == Phase.SECOND) {
                console.log("clicked second node, id: " + selectedNodeId);
                setAddPhase({
                    ...addPhase,
                    phase: Phase.ADD_BOX,
                    secondNodeId: selectedNodeId,
                });
                return;
            }

            // -------------------------- add category ----------------------------- //

            //click first node for adding category
            if (addCategoryPhase.phase == Phase.FIRST) {
                console.log("clicked first node to add category between");
                setAddCategoryPhase({
                    ...addCategoryPhase,
                    phase: Phase.SECOND,
                    firstNodeId: selectedNodeId,
                });
                return;
            }

            if (addCategoryPhase.phase == Phase.SECOND) {
                console.log("clicked second node to add category between");
                setAddCategoryPhase({
                    ...addCategoryPhase,
                    phase: Phase.ADD_BOX,
                    secondNodeId: selectedNodeId,
                });
                return;
            }

            // -------------------- handle expanding nodes ------------------------------//

            if (nodes) {
                for (const node of nodes)
                    if (
                        node.nodeId == selectedNodeId &&
                        node.nodeType != "INFO"
                    ) {
                        try {
                            expandNode(node);
                        } catch (e) {
                            console.error("CAUGHT ERROR")
                            setErrorMessage(e as string)
                            setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT)
                        }
                        return;
                    }
            }
        }
    }, [selectedNodeId]);

    useEffect(() => {

        if (statObject.username == "" || statObject.username == null)
            return;

        console.log("SENDING POST TO UPDATE EDGE LIST")

        const body: VoteData = {
            username: statObject.username,
            upvotedEdges: upvotedEdges,
            downvotedEdges: downvotedEdges
        };

        //send the new upvoted edges list to the mongo table
        fetch(`${HOST}/updateEdgeList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify(body)
        })
            .then(result => {
                if (!result.ok) {
                    setErrorMessage("Failed up update edge list")
                    setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT)
                }

                console.log("result on frontend:")
                console.log(result)
            })
    }, [upvotedEdges, downvotedEdges]);

    //hide the dialogue and update the nodes and relationships
    //prevent voting on the stack for the current user
    const addStackToFrontend = (body: CreateStackReturnBody) => {
        const requestNodes = body.nodes as GraphNode[];
        const requestRelationships = body.relationships;

        //add all these relationships to upvoted and downvoted edges so they cannot be modified
        //by the person who created them!

        for (const n of requestNodes)
            updateNode(n);

        //update or add rel
        for (const r of requestRelationships) {
            //add to upvoted and downvoted lists to prevent
            //the person who added the post from voting on it

            setUpvotedEdges([...upvotedEdges, r.relId])
            setDownvotedEdges([...downvotedEdges, r.relId])
            updateRelationship(r);
        }

        setStackLoading(false);
    };

    //when you click on add category
    function addBlankCategory() {
        setCategories([
            ...categories,
            {
                direction: Direction.NEUTRAL,
                nodeName: "",
                connectionName: "",
            },
        ]);
    }

    //update one of the categories during adding a stack or path
    function updateCategory(index: number, updateType: UpdateType, value: string | Direction) {
        if (index == BASE_CATEGORY_INDEX) {
            //update base category
            if (!setBaseCategory) {
                setErrorMessage("check assignment, base category not found")
            }

            switch (updateType) {
                case UpdateType.CONNECTION_DIRECTION:
                    setBaseCategory({
                        ...baseCategory,
                        direction: value as Direction,
                    });
                    break;
                case UpdateType.CONNECTION_NAME:
                    setBaseCategory({
                        ...baseCategory,
                        connectionName: value as string,
                    });
                    break;
                case UpdateType.NODE_NAME:
                    setBaseCategory({
                        ...baseCategory,
                        nodeName: value as string,
                    });
                    break;
            }

            return;
        }

        switch (updateType) {
            case UpdateType.CONNECTION_DIRECTION:
                setCategories(
                    categories.map((e, ind) => {
                        if (ind == index)
                            return {...e, direction: value as Direction};
                        return e;
                    }),
                );
                break;
            case UpdateType.CONNECTION_NAME:
                setCategories(
                    categories.map((e, ind) => {
                        if (ind == index)
                            return {...e, connectionName: value as string};
                        return e;
                    }),
                );

                break;
            case UpdateType.NODE_NAME:
                setCategories(
                    categories.map((e, ind) => {
                        if (ind == index)
                            return {...e, nodeName: value as string};
                        return e;
                    }),
                );

                break;
        }
    }

    //conditionally add a node if it doesn't exist
    function updateNode(toAdd: GraphNode) {
        if (toAdd == null) {
            setErrorMessage("Node is null")
            return;
        }

        setNodes((prevState) => {
            const existingIndex = prevState.findIndex(
                (node) => node.nodeId == toAdd.nodeId,
            );
            if (existingIndex !== -1)
                //node already added
                return prevState; //return old state

            if (toAdd.snippet != undefined) {
                console.log("ADDING NODE WITH SNIPPET");
            }

            //not found, insert new node
            return [...prevState, toAdd];
        });
    }

    //conditionally add a relationship if it doesn't exist
    function updateRelationship(result: NodeRelationship) {
        if (result == null) {
            console.error("REL IS NULL!!!!");
            return;
        }

        //update the relationships using the prev state
        setRelationships((prevState) => {
            const existingIndex = prevState.findIndex(
                (rel) => rel.relId === result.relId,
            );

            if (existingIndex !== -1) {
                const toUpdate = [...prevState];
                toUpdate[existingIndex] = {
                    ...toUpdate[existingIndex],
                    votes: result.votes,
                };
                return toUpdate;
            }

            //not found, insert the new rel
            return [result, ...prevState];
        });
    }

    //make an api request to upvote a relationship
    const upvoteEdge = async (edgeId: string, mustUpvote: boolean) => {

        //return early if in upvoted or downvoted already...
        if (mustUpvote && upvotedEdges.indexOf(edgeId) !== -1) {
            setErrorMessage("cannot upvote an edge twice")
            setTimeout(() => setErrorMessage(""), ERROR_MESSAGE_TIMEOUT)
            return;
        }

        if (!mustUpvote && downvotedEdges.indexOf(edgeId) != -1) {
            setErrorMessage("cannot downvote an edge twice")
            setTimeout(() => setErrorMessage(""), ERROR_MESSAGE_TIMEOUT)
            return;
        }

        const URL = mustUpvote ? `${HOST}/upvoteRel` : `${HOST}/downvoteRel`;
        //if in downvoted: remove
        //if not in upvoted: upvote

        await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                relId: edgeId,
            }),
        }).then(async (res) => {

            if (!res.ok) {
                setErrorMessage(res.statusText);
                return;
            }

            const result = await res.json();
            const relationship = result as UpvoteResult;

            //add to upvoted or downvoted edges to prevent doing it twice
            if (mustUpvote) {
                //if in downvoted edges, remove
                if (downvotedEdges.indexOf(edgeId) !== -1)
                    setDownvotedEdges(downvotedEdges.filter(e => e !== edgeId))
                else //otherwise add to upvoted edges
                    setUpvotedEdges([...upvotedEdges, edgeId])
            } else {
                //if in upvoted edges, remove
                if (upvotedEdges.indexOf(edgeId) !== -1)
                    setUpvotedEdges(upvotedEdges.filter(e => e !== edgeId))
                else //otherwise add ot downvoted edges
                    setDownvotedEdges([...downvotedEdges, edgeId])
            }

            if (relationship.newRelId != null) {
                //todo: remove from downvoted edges and prevent from being downvoted further
                setDownvotedEdges(downvotedEdges.filter(e => e != edgeId))
                setDownvotedEdges([...downvotedEdges, relationship.newRelId])


                //rel kept alive, add back
                setRelationships((prevState) =>
                    prevState?.map((rel) => {
                        if (rel.relId === relationship.relId) {
                            console.log("new rel REL");
                            console.log(rel);

                            //allow continual upvote
                            setSelectedEdgeId(relationship.newRelId!);

                            console.log(
                                "returning new rel with relID" +
                                relationship.relId,
                            );
                            return {
                                ...rel,
                                relId: relationship.newRelId!,
                                votes: relationship.votes,
                            };
                        }
                        return rel;
                    }),
                );

                //nothing more to do after adding back
                return;
            }

            //find and update the relationships, remove ones with 0 votes
            setRelationships((prevState) =>
                prevState
                    ?.map((rel) => {
                        if (rel.relId === relationship.relId)
                            return {
                                ...rel,
                                votes: relationship.votes,
                            };

                        return rel;
                    })
                    //filter out deleted relationships
                    .filter((rel) => rel.votes > 0),
            );
        });
    };

    //show the dialogue to add a category
    const addCategory = () => {
        setAddCategoryPhase({...addCategoryPhase, phase: Phase.FIRST});
    };

    //reset the nodes and edges for the next task
    const resetGraph = () => {
        setNodes((prevState) =>
            prevState.map(n => {
                return {
                    ...n,
                    isExpanded: false
                }
            }).filter(n => n.nodeType == "ROOT")
        )

        setRelationships([]);

        //reset the positions of the nodes
        setMustReset(true)
        setTimeout(() => {
            setMustReset(false)
        }, 10)

    };

    //category is not blank
    function isValidCategory(c: RequestBodyConnection) {
        return !(c.nodeName == "" || c.connectionName == "");
    }

    //validate that everything is filled out
    //send the request to the api to add the stack
    //then update the UI
    function tryCreateStack() {
        //check that everything has been filled out
        //loop through the categories and see that they have the correct info

        for (const c of categories) {
            if (!isValidCategory(c)) {
                setErrorMessage("please fill out all the categories");
                return;
            }
        }

        if (!isValidCategory(baseCategory)) {
            setErrorMessage("please fill out all the categories");
            setTimeout(() => {
                setErrorMessage(null)
            }, ERROR_MESSAGE_TIMEOUT)
            return;
        }

        if (categories.length < 2) {
            setErrorMessage("please create at least two subcategories");
            return;
        }

        if (info == "") {
            setErrorMessage(
                "please fill out information in the space provided",
            );
            return;
        }

        //all info filled out....
        //send a request
        //print details
        /* (() => {
             console.log(" ----------------------- ");
             console.log(" > Creating stack with the following items: < ");
             console.log("base");

             console.log("nodeName: ", baseCategory.nodeName);
             console.log("dir: ", baseCategory.direction);
             console.log("conn name: ", baseCategory.connectionName);
             console.log("node id: ", baseCategory.nodeId);
             console.log(" > sub categories < ");

             for (const c of categories) {
                 console.log("name: ", c.nodeName);
                 console.log("dir: ", c.direction);
                 console.log("conn name: ", c.connectionName);
             }

             console.log(" > info < ");
             console.log(heading);
             console.log(info);
             console.log(" ----------------------- ");
         })(); */

        //get the connections from the state
        const addedConnections: RequestBodyConnection[] = categories.map(
            (c) => {
                return {
                    nodeName: c.nodeName,
                    direction: c.direction,
                    connectionName: c.connectionName,
                };
            },
        );

        //construct the request
        const body: RequestBody = {
            rootNodeId: baseCategory.nodeId!,
            connections: [
                {
                    connectionName: baseCategory.connectionName,
                    nodeName: baseCategory.nodeName,
                    direction: baseCategory.direction,
                },
                ...addedConnections,
            ],
            infoNode: {
                label: heading,
                snippet: info,
            },
        };

        //button loading
        setStackLoading(true);

        fetch(`${HOST}/createStack`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        }).then(async (res) => {

            if (!res.ok) {
                setErrorMessage(res.statusText);
                setTimeout(() => setErrorMessage(""), ERROR_MESSAGE_TIMEOUT)
            } else {
                const body = (await res.json()) as CreateStackReturnBody;
                addStackToFrontend(body);
            }
            setStackLoading(false);
            setShowAddStackDialogue(false);
        }).catch(e => {
            setErrorMessage(e.toString())
            setTimeout(() => setErrorMessage(""), ERROR_MESSAGE_TIMEOUT)
        })
    }

    return (
        <div className={s.Container}>


            {/*network displayed here when enough nodes are present (don't include edges for empty case)*/}
            {nodes.length > 0 && (
                <MyNetwork
                    nodes={nodes}
                    relationships={relationships}
                    setSelectedNodeId={setSelectedNodeId}
                    setSelectedEdgeId={setSelectedEdgeId}
                    rerender={mustReset}
                    setDisplayLabels={setDisplayLabels}
                    displayLabels={displayLabels}
                />
            )}

            {/*dialogue when creating a connection*/}
            {/*or when the user wants to add a category between two nodes*/}
            <div className={s.CreateConnectionContainer}>
                {(addPhase.phase == Phase.FIRST ||
                    addCategoryPhase.phase == Phase.FIRST) && (
                    <p>Click on first node</p>
                )}
                {(addPhase.phase == Phase.SECOND ||
                    addCategoryPhase.phase == Phase.SECOND) && (
                    <p>Click on second node</p>
                )}
            </div>

            {/*buttons to add relationships and nodes*/}
            <div className={s.plus}>
                <AddButtons
                    showAddBox={() =>
                        setAddPhase({...addPhase, phase: Phase.FIRST})
                    }
                    showAddStack={() => setShowAddStackDialogue(true)}
                    addCategory={addCategory}
                />
            </div>

            {/* when the add connection phase requires the dialogue to be shown, */}
            {addPhase.phase == Phase.ADD_BOX && (
                <AddConnectionDialogue
                    firstNode={addPhase.firstNodeId}
                    hideAddBox={() =>
                        setAddPhase({...addPhase, phase: Phase.NONE})
                    }
                    secondNode={addPhase.secondNodeId}
                    reset={() =>
                        setAddPhase({...addPhase, phase: Phase.NONE})
                    }
                    updateRelationship={updateRelationship}
                    setErrorMessage={setErrorMessage}
                />
            )}

            {/* dialogue for adding categories */}
            {addCategoryPhase.phase == Phase.ADD_BOX && (
                <AddCategoryDialogue
                    hideDialogue={() =>
                        setAddCategoryPhase({
                            ...addCategoryPhase,
                            phase: Phase.NONE,
                        })
                    }
                    firstNodeId={addCategoryPhase.firstNodeId}
                    secondNodeId={addCategoryPhase.secondNodeId}
                    baseCategory={baseCategory}
                    setBaseCategory={setBaseCategory}
                    categories={categories}
                    setCategories={setCategories}
                    updateCategory={updateCategory}
                    addStackToFrontend={addStackToFrontend}
                    setErrorMessage={setErrorMessage}
                />
            )}

            {/* for adding a stack to the graph, create info node*/}
            {showAddStackDialogue && (
                <AddStackDialogue
                    hideAddStackDialogue={() => setShowAddStackDialogue(false)}
                    isLoading={stackLoading}
                    categories={categories}
                    addBlankCategory={addBlankCategory}
                    tryCreateStack={tryCreateStack}
                    setHeading={setHeading}
                    setInfo={setInfo}
                >
                    {/*Base category*/}
                    <CategoryComp
                        index={BASE_CATEGORY_INDEX}
                        updateCategory={updateCategory}
                        c={baseCategory}
                        isBaseCategory={true}
                        baseCategory={baseCategory}
                        dropDownBaseCategories={baseCategories}
                        setBaseCategory={setBaseCategory}
                        categories={categories}
                        setCategories={setCategories}
                        showCancel={false}
                        setErrorMessage={setErrorMessage}
                    />

                    {/* other custom categories that the user added */}
                    <div className={s.categoriesContainer}>
                        {categories.map(
                            (
                                c,
                                index, // for each new category added
                            ) => (
                                <CategoryComp
                                    key={index}
                                    index={index}
                                    updateCategory={updateCategory}
                                    c={c}
                                    isBaseCategory={false}
                                    categories={categories}
                                    setCategories={setCategories}
                                    showCancel={true}
                                    baseCategory={baseCategory}
                                    setBaseCategory={setBaseCategory}
                                    setErrorMessage={setErrorMessage}
                                />
                            ),
                        )}
                    </div>
                </AddStackDialogue>
            )}


            {/*buttons to upvote and downvote relationships*/}
            {selectedEdgeId != null &&
                upvoteDownvoteButtons(selectedEdgeId, upvoteEdge, upvotedEdges, downvotedEdges)}

            {/*task list for the user to complete*/}
            <Tasks
                resetGraph={resetGraph}
                statObject={statObject}
                setStatObject={setStatObject}
                setErrorMessage={setErrorMessage}
                getData={getData}
            />

            <div className={s.reset}>
                <HoverImage normalImage={"buttons/reset.svg"} hoverImage={"buttons/reset-hover.svg"}
                            message={"reset the graph"} onclick={resetGraph}
                            customPadding="45px"
                />
            </div>

            {errorMessage && <Error errorMessage={errorMessage}/>}
        </div>
    );
}

export default App;