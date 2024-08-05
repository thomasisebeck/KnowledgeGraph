export enum AddConnectionPhase {
    NONE,
    FIRST,
    SECOND,
    ADD_BOX
}

export enum ClickType {
    NODE,
    EDGE
}

export interface clickEvent {
    clickType: ClickType,
    id: string,
    node?: any
}

export interface Popup {
    mouseX: number,
    mouseY: number
}
