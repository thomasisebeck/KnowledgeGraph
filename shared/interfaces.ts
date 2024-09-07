export interface Task {
    question: string;
    answer: string;
    providedAnswer: string | null;
    totalTime: number;
    expandedNodesPerClick: number[];
    targetNodeId: string;
    clicksTillInNeighborhood: number;
    totalClicks: number;
    username: string;
}
export interface VoteData {
    username: string,
    upvotedEdges: string[],
    downvotedEdges: string[]
}

export interface GraphNode {
    isExpanded?: boolean,
    label: string
    nodeId: string
    nodeType: string
    snippet?: string
}

export interface Category {
    categoryName: string,
    connectionDirection: Direction,
    connectionName: string
}

export interface Neo4jNode {
    labels: string[];
    properties: {
        snippet?: string;
        label: string;
        nodeId: string;
    };
    elementId: string;
}

export interface CreateStackReturnBody {
    nodes: GraphNode[],
    relationships: NodeRelationship[]
}

export enum Direction {
    TOWARDS,
    AWAY,
    NEUTRAL
}

//connect an individual relationship
export interface CreateRelRequestBody {
    name: string,
    fromId: string,
    toId: string,
    direction: Direction
}

//create relationships in a stack
export interface RequestBodyConnection {
    nodeName: string,
    connectionName: string,
    direction: Direction,
    nodeId?: string
}

export interface ConnectionPathConnection {
    direction: Direction,
    label: string
}

export interface ConnectionPath {
    firstNodeId: string
    nodes: string[]
    connections: ConnectionPathConnection[] 
    secondNodeId: string
}

export interface RequestBody {
    infoNode: {
        label: string,
        snippet: string
    },
    connections: RequestBodyConnection[],
    rootNodeId: string
}

export interface FrontendBaseCateogries {
    nodeId: string,
    label: string
}
export enum Phase {
    NONE,
    FIRST,
    SECOND,
    ADD_BOX,
}

export interface AddPhase {
    phase: Phase;
    firstNodeId: string;
    secondNodeId: string;
}

export interface NodeRelationship {
    type: string,
    relId: string,
    votes: number
    to: string,
    from: string,
    direction: Direction,
}

export interface UpvoteResult {
    relId: string,
    votes: number,
    newRelId?: string
}

export interface Segment {
    endNodeId: string,
    startNodeId: string,
    rel: {
        properties: {
            relId: string,
            votes: any
        }
        type: string
    },
    isDoubleSided: boolean
}

export interface NodePair {
    firstNodeId: string,
    secondNodeId: string
}

export interface GraphType {
    nodes: GraphNode[] | undefined,
    relationships: NodeRelationship[] | undefined,
    setSelectedNodeId: (nodeId: string | null) => void
    setSelectedEdgeId: (edgeId: string | null) => void
    displayLabels: boolean,
    setDisplayLabels: (newValue: boolean) => void
    rerender: boolean
}

export interface HoverImageInterface {
    normalImage: string,
    hoverImage: string,
    onclick: () => void,
    message: string,
    customPadding? : string
}

export const ROOT = "ROOT";
export const BOTH = "INFO | CLASS";
export const INFO = "INFO";
export const CLASS = "CLASS";
export const INDEX_NAME = 'nodesIndex'
export const INITIAL_VOTES = 3;