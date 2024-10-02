import React, { useState } from "react";
import {
    CreateRelRequestBody,
    Direction,
    NodeRelationship,
} from "../../../../shared/interfaces";
import Dialogue from "../Dialogue/Dialogue";
import { ERROR_MESSAGE_TIMEOUT, HOST } from "../../../../shared/variables";
import Error from "../Error/Error";

//dialogue to add a connection between two nodes
function AddConnectionDialogue({
    hideAddBox,
    firstNode,
    secondNode,
    reset,
    updateRelationship,
    setErrorMessage,
}: {
    hideAddBox: () => void;
    firstNode: string | null;
    secondNode: string | null;
    reset: () => void;
    updateRelationship: (myRel1: NodeRelationship) => void;
    setErrorMessage: (value: string | null) => void;
}) {
    const nameRef = React.useRef<HTMLInputElement | null>(null);
    const checkRef = React.useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    //function to send an api request to create a connection
    const createConnection = async (name: string, direction: Direction) => {

        updateRelationship({
            type: 'influences',
            relId: 'ecosystems-to-meteorology',
            votes: 5,
            to: 'ecosystems',
            from: 'meteorology',
            direction: Direction.NEUTRAL
        });

    };

    const tryCreateConnection = async () => {
        if (nameRef.current != null && checkRef.current != null) {
            if (nameRef.current.value != "") {
                setIsLoading(true);
                const name = nameRef.current.value;
                const isDoubleSided = checkRef.current.checked;
                await createConnection(
                    name,
                    isDoubleSided ? Direction.NEUTRAL : Direction.AWAY,
                );
                setIsLoading(false);
                hideAddBox();
                return;
            }
        }

        setErrorMessage("name is not set");
        setTimeout(() => setErrorMessage(""), ERROR_MESSAGE_TIMEOUT);
    };

    return (
        <React.Fragment>
            <Dialogue hideDialogue={hideAddBox} title={"Create Connection"}>
                <div>
                    <label>Name the connection:</label>
                    <input type={"text"} ref={nameRef} />
                </div>
                <div>
                    <label>Double sided:</label>
                    <input type={"checkbox"} ref={checkRef} />
                </div>

                {/*loading button for creating stack*/}
                {isLoading ? (
                    <button className={"buttonDisabled"}>Please wait...</button>
                ) : (
                    <button onClick={tryCreateConnection}>Create</button>
                )}
            </Dialogue>
        </React.Fragment>
    );
}

export default AddConnectionDialogue;
