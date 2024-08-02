export enum nodeType {
    CLASSIFICATION,
    INFORMATION,
    ROOT
}

export interface Node {
    label: string,
    nodeId: string
    snippet?: string
    nodeType: string
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

export interface RequestBodyConnection {
    name: string,
    direction: Direction
}

export interface RequestBody {
    infoNode: {
        label: string,
        snippet: string
    },
    classificationNodes: string[],
    connections: RequestBodyConnection[],
}

export interface NodeRelationship {
    type: string,
    relId: string,
    votes: number
    to: string,
    from: string,
    direction: Direction,
}

export interface GraphType {
    nodes: GraphNode[] | undefined,
    relationships: NodeRelationship[] | undefined,
    clickEvent: (event: any) => void
}

export interface HoverImageInterface {
    normalImage: string,
    hoverImage: string,
    onclick: () => void,
    message: string
}

export interface GraphNode {
    label: string,
    nodeId: string
    snippet?: string
    nodeType: nodeType
}

export interface GraphType {
    nodes: GraphNode[] | undefined,
    relationships: NodeRelationship[] | undefined,
    clickEvent: (event: any) => void
}

export interface createRelRequestBody {
    name: string,
    fromId: string,
    toId: string,
    connection: RequestBodyConnection
}