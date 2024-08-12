import React from 'react'
import Dialogue from "./Dialogue/Dialogue";

interface AddCategoryDialogueProps {
    hideDialogue: () => void
}

const AddCategoryDialogue = ({hideDialogue}: AddCategoryDialogueProps) => {
    return (
        <Dialogue hideDialogue={hideDialogue} title={"Add connection path between two nodes"}>
            <div>AddCategoryDialogue</div>
        </Dialogue>
    )
}
export default AddCategoryDialogue
