export enum nodeType {
    CLASSIFICATION,
    INFORMATION
}

export interface Node {
    label: string,
    nodeId: string
    snippet?: string
    nodeType: nodeType
}

export interface CreateStackReturnBody {
    nodes: Node[],
    relationships: NodeRelationship[]
}

export interface createRelRequestBody {
    name: string,
    fromId: string,
    toId: string,
    doubleSided: boolean
}

export interface RequestBody {
    infoNode: {
        label: string,
        snippet: string
    },
    classificationNodes: string[],
    connections: string[],
    doubleSided: boolean[]
}

export interface NodeRelationship {
    type: string,
    relId: string,
    votes: number,
    to: string,
    from: string
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

export interface RequestBody {
    infoNode: {
        label: string,
        snippet: string
    },
    classificationNodes: string[],
    connections: string[],
    doubleSided: boolean[]
}

export interface createRelRequestBody {
    name: string,
    fromId: string,
    toId: string,
    doubleSided: boolean
}

export interface NodeRelationship {
    type: string,
    relId: string,
    votes: number,
    to: string,
    from: string
}
