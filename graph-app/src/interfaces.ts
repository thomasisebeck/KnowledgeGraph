export enum nodeType {
    CLASSIFICATION,
    INFORMATION
}

export interface GraphNode {
    label: string,
    nodeId: string
    snippet?: string
    nodeType: nodeType
}

export interface GraphType {
    nodes: GraphNode[] | undefined,
    relationships: NodeRelationship[] | undefined
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