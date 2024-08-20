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
    UpvoteResult,
} from "../../shared/interfaces";
import AddConnectionDialogue from "./components/CustomDialogues/AddConnectionDialogue";
import {AddButtons} from "./components/AddButtons/AddButtons";
import AddStackDialogue from "./components/AddStackDialogue/AddStackDialogue";
import {AddPhase, Phase} from "./interfaces";
import {BASE_CATEGORY_INDEX, HOST} from "../../shared/variables";
import s from "./App.module.scss";
import {upvoteDownvoteButtons} from "./components/UpvoteDownvoteButtons";
import Tasks from "./components/Tasks/Tasks";
import AddCategoryDialogue from "./components/CustomDialogues/AddCategoryDialogue";
import CategoryComp from "./components/Category/CategoryComp";
import {UpdateType} from "./components/AddStackDialogue/DialogueUtils";
import {HoverImage} from "./components/HoverImage/HoverImage";
import {getUnpackedSettings} from "node:http2";

function App() {
    //graph stuff
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [relationships, setRelationships] = useState<NodeRelationship[]>([]);
    const [mustReset, setMustReset] = useState(false)

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

    //stats
    const [expandedNodesPerClick, setExpandedNodesPerClick] = useState<
        number[]
    >([]);
    const [precisionPerClick, sePrecisionPerClick] = useState<number[]>([]);
    const [recallPerClick, setRecallPerClick] = useState<number[]>([]);

    //loading and showing dialogues
    const [showGraph, setShowGraph] = useState(true);
    const [showAddStackDialogue, setShowAddStackDialogue] =
        useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState("");

    //show dropdown
    const [baseCategories, setBaseCategories] = useState<
        FrontendBaseCateogries[]
    >([]);

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

    //add a node when clicking on a snippet to show the information
    const expandNode = async (newNode: any) => {
        console.log("expanding node...")
        console.log(newNode)


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

            const neighborhood = await fetch(
                `${HOST}/neighborhood/${newNode.nodeId}/${DEPTH}`,
            ).then(async (result) => {
                return await result.json();
            });

            //use the copy to keep the white node
            const newNodes = nodesCopy;

            let currExpandedNodes = 0;

            for (const node of neighborhood.nodes) {
                const index = newNodes.findIndex(
                    (n) => n.nodeId == node.nodeId,
                );
                if (index == -1) {
                    //add each node not found in the current nodes
                    newNodes.push(node);
                    currExpandedNodes++;
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
                    console.log("FOUND NODE")
                    return {
                        ...n,
                        isExpanded: true
                    }
                }
                return n;
            }));

            setRelationships([...newRels]);
            setExpandedNodesPerClick([
                ...expandedNodesPerClick,
                currExpandedNodes,
            ]);
        }
    };

    //initial data from database
    function getData() {
        fetch(`${HOST}/initialData`)
            .then(async (res) => {
                const data = await res.json();
                console.log("FRONTEND INIT DATA");
                console.log(data);

                const nodes = data.topicNodes as GraphNode[];

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

                console.log("NODES SET");
            })
            .catch((e) => {
                console.error(e);
            });
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
                        expandNode(node);
                        return;
                    }
            }
        }
    }, [selectedNodeId]);

    //hide the dialogue and update the nodes and relationships
    const addStackToFrontend = (body: CreateStackReturnBody) => {
        const requestNodes = body.nodes as GraphNode[];
        const requestRelationships = body.relationships;

        for (const n of requestNodes) updateNode(n);

        //update or add rel
        for (const r of requestRelationships) updateRelationship(r);

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

    function updateCategory(index: number, updateType: UpdateType, value: string | Direction) {
        if (index == BASE_CATEGORY_INDEX) {
            //update base category
            if (!setBaseCategory)
                throw "check assigment, base category is not found!";

            console.log("UPDATING BASE CATEGORY");
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

        console.log("UPDATING OTHER CATEGORY");
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
        console.log("TO ADD");
        console.log(toAdd);

        if (toAdd == null) {
            console.error("Node is null");
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
        const URL = mustUpvote ? `${HOST}/upvoteRel` : `${HOST}/downvoteRel`;

        await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                relId: edgeId,
            }),
        }).then(async (res) => {
            const result = await res.json();
            const relationship = result as UpvoteResult;

            if (relationship.newRelId != null) {
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

    const addCategory = () => {
        setAddCategoryPhase({...addCategoryPhase, phase: Phase.FIRST});
    };

    //reset the nodes and edges for the next task
    const resetGraph = () => {
        setShowGraph(false);
        setNodes((prevState) =>
            prevState.map(n => {
                return {
                    ...n,
                    isExpanded: false
                }
            }).filter(n => n.nodeType == "ROOT")
        )

        setRelationships([]);
        setShowGraph(true);
        setExpandedNodesPerClick([])
        setMustReset(!mustReset)

    };

    //category is not blank
    function isValidCategory(c: RequestBodyConnection) {
        return !(c.nodeName == "" || c.connectionName == "");
    }

    //validate that everything is filled out
    //send the request to the api to add the stack
    //then update the UI
    function tryCreateStack() {
        //check that eveything has been filled out
        //loop through the categories and see that they have the correct info

        for (const c of categories) {
            if (!isValidCategory(c)) {
                setErrorMessage("please fill out all the categories");
                return;
            }
        }

        if (!isValidCategory(baseCategory)) {
            setErrorMessage("please fill out all the categories");
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
        (() => {
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
        })();

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
        }).then(async (result) => {
            console.log("App.ts AFTER CREATING STACK");

            if (result.status === 200) {
                const body = (await result.json()) as CreateStackReturnBody;
                addStackToFrontend(body);
            } else {
                console.error("Cannot add stack to frontend");
                console.error(result.status);
                console.error(result);
            }

            setStackLoading(false);
            setShowAddStackDialogue(false);
        });
    }

    return (
        <div className={s.Container}>
            {/*network displayed here when enough nodes are present (don't include edges for empty case)*/}
            {nodes.length > 0 && showGraph && (
                <MyNetwork
                    nodes={nodes}
                    relationships={relationships}
                    setSelectedNodeId={setSelectedNodeId}
                    setSelectedEdgeId={setSelectedEdgeId}
                    rerender={mustReset}
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
                />
            )}

            {/* for adding a stack to the graph, create info node*/}
            {showAddStackDialogue && (
                <AddStackDialogue
                    hideAddStackDialogue={() => setShowAddStackDialogue(false)}
                    isLoading={stackLoading}
                    errorMessage={errorMessage}
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
                                />
                            ),
                        )}
                    </div>
                </AddStackDialogue>
            )}

            {/*buttons to upvote and downvote relationships*/}
            {selectedEdgeId != null &&
                upvoteDownvoteButtons(selectedEdgeId, upvoteEdge)}

            {/*task list for the user to complete*/}
            <Tasks
                resetGraph={resetGraph}
                expandedNodesPerClick={expandedNodesPerClick}
                precisionsPerClick={precisionPerClick}
                recallPerClick={recallPerClick}
            />

            <div className={s.reset}>
                <HoverImage normalImage={"buttons/reset.svg"} hoverImage={"buttons/reset-hover.svg"}
                            message={"reset the graph"} onclick={resetGraph}
                            customPadding="45px"
                />
            </div>
        </div>
    );
}

export default App;
