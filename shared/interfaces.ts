export interface Node {
    label: string,
    nodeId: string
    snippet?: string
    nodeType: string
    isSnippetNode?:boolean
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
    nodes: Node[],
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

export interface GraphType {
    nodes: Node[] | undefined,
    relationships: NodeRelationship[] | undefined,
    clickEvent: (event: any) => void
    addNode: (newNode: any) => void
}

export interface HoverImageInterface {
    normalImage: string,
    hoverImage: string,
    onclick: () => void,
    message: string
}

export interface GraphType {
    nodes: Node[] | undefined,
    relationships: NodeRelationship[] | undefined,
    clickEvent: (event: any) => void
}