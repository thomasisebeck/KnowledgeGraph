import React, { useEffect, useState } from "react";
import MyNetwork from "./components/MyNetwork/MyNetwork.js";
import {
    CreateStackReturnBody,
    Direction,
    FrontendBaseCateogries,
    GraphNode,
    NodeRelationship,
    RequestBodyConnection,
    Task,
    VoteData,
    INFO,
    ROOT,
    CLASS,
    AddPhase,
    Phase,
} from "../../shared/interfaces";
import {
    BASE_CATEGORY_INDEX,
    ERROR_MESSAGE_TIMEOUT,
    HOST,
} from "../../shared/variables";
import AddConnectionDialogue from "./components/CustomDialogues/AddConnectionDialogue";
import { AddButtons } from "./components/AddButtons/AddButtons";
import AddStackDialogue from "./components/AddStackDialogue/AddStackDialogue";

import s from "./App.module.scss";
import { upvoteDownvoteButtons } from "./components/UpvoteDownvoteButtons";
import AddCategoryDialogue from "./components/CustomDialogues/AddCategoryDialogue";
import CategoryComp from "./components/Category/CategoryComp";
import { UpdateType } from "./components/AddStackDialogue/DialogueUtils";
import { HoverImage } from "./components/HoverImage/HoverImage";
import Error from "./components/Error/Error";

function App() {
    //graph components
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [relationships, setRelationships] = useState<NodeRelationship[]>([]);
    const [mustReset, setMustReset] = useState(true);
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
    const [showAddStackDialogue, setShowAddStackDialogue] =
        useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        username: "",
        linkLabels: false,
    });

    const [upvotedEdges, setUpvotedEdges] = useState<string[]>([]);
    const [downvotedEdges, setDownvotedEdges] = useState<string[]>([]);

    const updateStatObject = (newObj: Task) => {
        setStatObject({ ...newObj });
    };

    const [currStep, setCurrStep] = useState(0);

    const tutorialSteps: string[] = [
        "Welcome to Connections! \n This tutorial will guide you around the interface.",
        "Connections is a way to add and relate knowledge in an interactive way using a knowledge graph.",
        "See the nodes in the center of the screen? Those are the base categories.",
        "Every piece of knowledge added to the knowledge graph can be found expanding one of these categories.",
        "Click on the 'ethics' node to see what knowledge lies underneath.",
        "Notice how the connections are logical. They can be hierarchical (big to small), for instance: morals -> moral dilemmas. Or they can be siblings, for instance: morals - ethics.",
        "Remember, the big nodes are the base categories, and the smaller nodes are subcategories which can interact with other categories.",
        "Click on the reset button (lower right) to reset the graph.",
        "This will allow you to return to the view you started with.",
        "Now expand both the 'nature' and 'science' base categories.",
        "Expand the 'ecology' node as well to see what it contains.",
        "Click on the menu in the bottom right corner to show the options.",
        "Now click on 'connect two nodes', which will allow you to bridge the missing gap.",
        "Click on the 'ecosystems' node (under nature - biology - ecology) and then the 'meteorology' node (under science) to bridge the gap. Name the new connection 'influences' to represent the relationship. Also make it a double-sided relationship to show that they both influence one another.",
        "Notice how you have changed the organization of concepts on the graph.",
        "Other people will be able to find the information through the new path that you created.",
        "Let's now add a sub-category to the graph to further refine a classification.",
        "Reset the graph, and then expand the science node.",
        "Expand the menu in the lower right corner.",
        "Click on 'Add connection path between two nodes'.",
        "Click on meteorology, and then science.",
        "We want to refine this path to add another category in between these two categories.",
        "Let's add a category called 'geology', which is higher up in the hierarchy than 'meteorology', but lower than 'science'. Go ahead and name the middle node (orange circle) 'geology'.",
        "Name the top connection 'uses', and set the direction so that it points upwards.",
        "Name the bottom connection 'includes', and set the direction so that it points downwards.",
        "In future, you can add as many categories as you want in between two nodes, but for now just click 'Create Path'.",
        "Notice how you have refined the categorisation of this information snippet on the graph.",
        "Click on the connection between science and meteorology (is a subcategory of) and downvote it using the arrow on the right to express that you want it to disappear in future, as you prefer your new path.",
        "Downvoting connections helps clean up the graph by removing connections that don't make much sense.",
        "This helps people better find and comprehend the conceptual links on the graph.",
        "Reset the graph again using the reset button.",
        "Expand the menu in the lower right corner.",
        "Click on 'create node with information' (the top button).",
        "Type: 'Spots of a ladybug' in the title box near the bottom.",
        "Type: 'The bright spots on a ladybug act as a warning sign. They contain toxins which are unpalatable to predators.' in the information box.",
        "Now, you can add categories to place this information in context.",
        "Select 'nature' for the root category by expanding the dropdown for the top category node (the orange circle).",
        "Type 'associated with' in the first connection label, and make sure the direction as neutral or undirected (the line next to the connection label should be a simple stripe).",
        "Type 'biology' as the first category name.",
        "Type 'subset' in the second connection label, and toggle the direction to point downwards by clicking on the circular button until the arrow faces the right direction.",
        "Add another category by clicking on the 'add category' button.",
        "Type 'insect' in the second category name.",
        "Type 'type of' in the third connection label, and toggle the direction to point upwards by clicking on the circular button next to it once.",
        "Add one last category by clicking on the 'add category' button, and scroll down to bring it into view.",
        "Type 'ladybug' as the final category name.",
        "Type 'appearance' as the final connection label, and toggle the direction to point downwards.",
        "Take one last look at how the information is logically structured, and then press the 'create stack' button to add it to the graph.",
        "Well done! You have added knowledge to the graph so that others may now find it.",
        "The point of adding and rearranging knowledge is to help people discover information and make conceptual links.",
        "The real system will contain much more nodes and links.",
        "You will help to rearrange the knowledge on the graph to help other people discover information more easily.",
    ];

    //add a node when clicking on a snippet to show the information
    const expandNode = async (newNode: any) => {
        switch (newNode.nodeId) {
            case "ethics":
                console.log("adding ethics nodes");

                updateNode({
                    label: "morals",
                    nodeId: "morals",
                    nodeType: CLASS,
                });

                updateNode({
                    label: "moral dilemmas",
                    nodeId: "moral dilemmas",
                    nodeType: CLASS,
                });

                updateNode({
                    label: "medial ethical dilemma",
                    snippet:
                        "A doctor may face the difficult decision of prioritizing the life of a mother over her unborn child in a medical emergency. Such situations highlight the complexities of ethical decision-making and the importance of considering the potential consequences of each choice.",
                    nodeId: "medial ethical dilemma",
                    nodeType: INFO,
                });

                updateRelationship({
                    type: "associated with",
                    relId: "ethics-to-morals",
                    votes: 3,
                    from: "ethics",
                    to: "morals",
                    direction: Direction.NEUTRAL,
                });

                updateRelationship({
                    type: "encompasses",
                    relId: "morals-to-dilemmas",
                    votes: 3,
                    from: "morals",
                    to: "moral dilemmas",
                    direction: Direction.AWAY,
                });

                updateRelationship({
                    type: "encompasses",
                    relId: "moral-dilemmas-to-medial",
                    votes: 3,
                    from: "moral dilemmas",
                    to: "medial ethical dilemma",
                    direction: Direction.AWAY,
                });

                break;
            case "nature":
                //------------ photosynthesis ------------------//
                // Nodes
                updateNode({
                    label: "biology",
                    nodeId: "biology",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "botany",
                    nodeId: "botany",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "photosynthesis",
                    nodeId: "photosynthesis",
                    nodeType: INFO,
                    snippet:
                        "Photosynthesis is the process by which plants convert sunlight into energy. It involves the use of chlorophyll to capture light energy and convert it into chemical energy, stored in glucose. Photosynthesis is essential for life on Earth, as it provides the energy that fuels most ecosystems.",
                });
                // Relationships
                updateRelationship({
                    type: "is a subcategory of",
                    relId: "botany-to-biology",
                    votes: 3,
                    from: "botany",
                    to: "biology",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "is a subcategory of",
                    relId: "biology-to-nature",
                    votes: 3,
                    from: "biology",
                    to: "nature",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "includes",
                    relId: "botany-to-photosynthesis",
                    votes: 3,
                    from: "botany",
                    to: "photosynthesis",
                    direction: Direction.AWAY,
                });

                //------------------------------ biodiversity -----------//

                // Nodes
                updateNode({
                    label: "ecology",
                    nodeId: "ecology",
                    nodeType: CLASS,
                });

                // Relationships
                updateRelationship({
                    type: "is a subcategory of",
                    relId: "ecology-to-biology",
                    votes: 3,
                    from: "ecology",
                    to: "biology",
                    direction: Direction.AWAY,
                });

                break;
            case "science":
                // Nodes
                updateNode({
                    label: "science",
                    nodeId: "science",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "physics",
                    nodeId: "physics",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "mechanics",
                    nodeId: "mechanics",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "simple harmonic motion",
                    nodeId: "simple harmonic motion",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "pendulum",
                    nodeId: "pendulum",
                    nodeType: INFO,
                    snippet:
                        "A pendulum is a simple mechanical system consisting of a mass suspended from a fixed point by a string or rod. When displaced from its equilibrium position, it oscillates back and forth under the influence of gravity, exhibiting simple harmonic motion.",
                });

                // Relationships
                updateRelationship({
                    type: "is a subcategory of",
                    relId: "physics-to-science",
                    votes: 3,
                    from: "physics",
                    to: "science",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "is a subcategory of",
                    relId: "mechanics-to-physics",
                    votes: 3,
                    from: "mechanics",
                    to: "physics",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "includes",
                    relId: "mechanics-to-simple-harmonic-motion",
                    votes: 3,
                    from: "mechanics",
                    to: "simple harmonic motion",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "describes",
                    relId: "simple-harmonic-motion-to-pendulum",
                    votes: 3,
                    from: "simple harmonic motion",
                    to: "pendulum",
                    direction: Direction.AWAY,
                });

                // Nodes
                updateNode({
                    label: "science",
                    nodeId: "science",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "meteorology",
                    nodeId: "meteorology",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "weather phenomena",
                    nodeId: "weather phenomena",
                    nodeType: INFO,
                    snippet:
                        "Weather phenomena are short-term atmospheric conditions, such as storms, rain, and wind.",
                });

                // Relationships
                updateRelationship({
                    type: "is a subcategory of",
                    relId: "meteorology-to-science",
                    votes: 3,
                    from: "meteorology",
                    to: "science",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "includes",
                    relId: "meteorology-to-weather-phenomena",
                    votes: 3,
                    from: "meteorology",
                    to: "weather phenomena",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "describes",
                    relId: "weather phenomena-to-storms",
                    votes: 3,
                    from: "weather phenomena",
                    to: "storms",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "describes",
                    relId: "weather phenomena-to-rain",
                    votes: 3,
                    from: "weather phenomena",
                    to: "rain",
                    direction: Direction.AWAY,
                });

                break;

            case "ecology":
                updateNode({
                    label: "ecosystems",
                    nodeId: "ecosystems",
                    nodeType: CLASS,
                });
                updateNode({
                    label: "biodiversity",
                    nodeId: "biodiversity",
                    nodeType: INFO,
                    snippet:
                        "Biodiversity refers to the variety of life on Earth, including plants, animals, fungi, and microorganisms. It is essential for the health and stability of ecosystems.",
                });
                updateRelationship({
                    type: "includes",
                    relId: "ecology-to-ecosystems",
                    votes: 3,
                    from: "ecology",
                    to: "ecosystems",
                    direction: Direction.AWAY,
                });
                updateRelationship({
                    type: "related",
                    relId: "ecosystems-to-biodiversity",
                    votes: 3,
                    from: "ecosystems",
                    to: "biodiversity",
                    direction: Direction.NEUTRAL,
                });
        }
    };

    //initial data from database
    function getData() {
        const nodes: GraphNode[] = [
            {
                label: "ethics",
                nodeId: "ethics",
                nodeType: ROOT,
            },
            {
                label: "nature",
                nodeId: "nature",
                nodeType: ROOT,
            },
            {
                label: "science",
                nodeId: "science",
                nodeType: ROOT,
            },
        ];

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

        getData();
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
                            console.error("CAUGHT ERROR");
                            setErrorMessage(e as string);
                            setTimeout(
                                () => setErrorMessage(null),
                                ERROR_MESSAGE_TIMEOUT,
                            );
                        }
                        return;
                    }
            }
        }
    }, [selectedNodeId]);

    useEffect(() => {
        if (statObject.username == "" || statObject.username == null) return;

        console.log("SENDING POST TO UPDATE EDGE LIST");

        const body: VoteData = {
            username: statObject.username,
            upvotedEdges: upvotedEdges,
            downvotedEdges: downvotedEdges,
        };

        //send the new upvoted edges list to the mongo table
        fetch(`${HOST}/updateEdgeList`, {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify(body),
        }).then((result) => {
            if (!result.ok) {
                setErrorMessage("Failed up update edge list");
                setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT);
            }

            console.log("result on frontend:");
            console.log(result);
        });
    }, [upvotedEdges, downvotedEdges]);

    //hide the dialogue and update the nodes and relationships
    //prevent voting on the stack for the current user
    const addStackToFrontend = (body: CreateStackReturnBody) => {
        const requestNodes = body.nodes as GraphNode[];
        const requestRelationships = body.relationships;

        //add all these relationships to upvoted and downvoted edges so they cannot be modified
        //by the person who created them!

        for (const n of requestNodes) updateNode(n);

        //update or add rel
        for (const r of requestRelationships) {
            //add to upvoted and downvoted lists to prevent
            //the person who added the post from voting on it

            setUpvotedEdges([...upvotedEdges, r.relId]);
            setDownvotedEdges([...downvotedEdges, r.relId]);
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
    function updateCategory(
        index: number,
        updateType: UpdateType,
        value: string | Direction,
    ) {
        if (index == BASE_CATEGORY_INDEX) {
            //update base category
            if (!setBaseCategory) {
                setErrorMessage("check assignment, base category not found");
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
                            return { ...e, direction: value as Direction };
                        return e;
                    }),
                );
                break;
            case UpdateType.CONNECTION_NAME:
                setCategories(
                    categories.map((e, ind) => {
                        if (ind == index)
                            return { ...e, connectionName: value as string };
                        return e;
                    }),
                );

                break;
            case UpdateType.NODE_NAME:
                setCategories(
                    categories.map((e, ind) => {
                        if (ind == index)
                            return { ...e, nodeName: value as string };
                        return e;
                    }),
                );

                break;
        }
    }

    //conditionally add a node if it doesn't exist
    function updateNode(toAdd: GraphNode) {
        if (toAdd == null) {
            setErrorMessage("Node is null");
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
        if (mustUpvote) return;

        setRelationships(
            relationships.map((r) => {
                if (r.relId == "meteorology-to-science")
                    return {
                        ...r,
                        votes: 1,
                    };
                return r;
            }),
        );
    };

    //show the dialogue to add a category
    const addCategory = () => {
        setAddCategoryPhase({ ...addCategoryPhase, phase: Phase.FIRST });
    };

    //reset the nodes and edges for the next task
    const resetGraph = () => {
        setNodes((prevState) =>
            prevState
                .map((n) => {
                    return {
                        ...n,
                        isExpanded: false,
                    };
                })
                .filter((n) => n.nodeType == "ROOT"),
        );

        setRelationships([]);

        //reset the positions of the nodes
        setMustReset(true);
        setTimeout(() => {
            setMustReset(false);
        }, 10);
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
                setErrorMessage(null);
            }, ERROR_MESSAGE_TIMEOUT);
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

        //add the nodes
        updateNode({
            label: "nature",
            nodeId: "nature",
            nodeType: CLASS,
        });
        updateNode({
            label: "biology",
            nodeId: "biology",
            nodeType: CLASS,
        });
        updateNode({
            label: "insect",
            nodeId: "insect",
            nodeType: CLASS,
        });
        updateNode({
            label: "ladybug",
            nodeId: "ladybug",
            nodeType: CLASS,
        });
        updateNode({
            label: "Spots of a ladybug",
            snippet:
                "The bright spots on a ladybug act as a warning sign. They contain toxins which are unpalatable to predators.",
            nodeId: "spots-of-a-ladybug",
            nodeType: INFO,
        });

        //add the relationships
        updateRelationship({
            type: "appearance",
            relId: "appearance-ladybug",
            votes: 3,
            from: "ladybug",
            to: "spots-of-a-ladybug",
            direction: Direction.AWAY,
        });

        updateRelationship({
            type: "type of",
            relId: "insect-ladybug",
            votes: 3,
            from: "insect",
            to: "ladybug",
            direction: Direction.TOWARDS,
        });

        updateRelationship({
            type: "subsets",
            relId: "bio-insect",
            votes: 3,
            from: "biology",
            to: "insect",
            direction: Direction.AWAY,
        });

        updateRelationship({
            type: "subset",
            relId: "subset-bio",
            votes: 3,
            from: "nature",
            to: "biology",
            direction: Direction.AWAY,
        });

        setShowAddStackDialogue(false);
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
                    statObject={statObject}
                    setStatObject={setStatObject}
                    upvotedEdges={upvotedEdges}
                    downvotedEdges={downvotedEdges}
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
                        setAddPhase({ ...addPhase, phase: Phase.FIRST })
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
                        setAddPhase({ ...addPhase, phase: Phase.NONE })
                    }
                    secondNode={addPhase.secondNodeId}
                    reset={() =>
                        setAddPhase({ ...addPhase, phase: Phase.NONE })
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
                upvoteDownvoteButtons(
                    selectedEdgeId,
                    upvoteEdge,
                    upvotedEdges,
                    downvotedEdges,
                )}

            <div className={s.reset}>
                <HoverImage
                    normalImage={"buttons/reset.svg"}
                    hoverImage={"buttons/reset-hover.svg"}
                    message={"reset the graph"}
                    onclick={resetGraph}
                    customPadding="45px"
                />
            </div>

            <div className={s.tutorialBox}>
                <div>
                    {currStep < tutorialSteps.length ? (
                        <div>
                            <div className={s.step}>
                                {tutorialSteps[currStep]}
                            </div>
                            <div className={s.buttonContainer}>
                                {currStep > 0 && (
                                    <button
                                        onClick={() =>
                                            setCurrStep(currStep - 1)
                                        }
                                    >
                                        Prev
                                    </button>
                                )}
                                <button
                                    onClick={() => setCurrStep(currStep + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>Tutorial complete</div>
                    )}
                </div>
            </div>
            {errorMessage && <Error errorMessage={errorMessage} />}
        </div>
    );
}

export default App;
