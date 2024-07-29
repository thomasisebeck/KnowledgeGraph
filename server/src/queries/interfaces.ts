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
