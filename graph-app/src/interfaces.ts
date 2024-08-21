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

export enum ClickType {
    NODE,
    EDGE,
}



export interface clickEvent {
    clickType: ClickType;
    id: string;
    node?: any;
}

export interface Popup {
    mouseX: number;
    mouseY: number;
}
