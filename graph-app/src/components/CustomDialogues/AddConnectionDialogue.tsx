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
}: {
    hideAddBox: () => void;
    firstNode: string | null;
    secondNode: string | null;
    reset: () => void;
    updateRelationship: (myRel1: NodeRelationship) => void;
}) {
    const nameRef = React.useRef<HTMLInputElement | null>(null);
    const checkRef = React.useRef<HTMLInputElement | null>(null);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [isLoading, setIsLoading] = useState(false);

    //function to send an api request to create a connection
    const createConnection = async (name: string, direction: Direction) => {
        if (firstNode == null || secondNode == null) {
            console.log("First or second is null");
            reset();
            return;
        }

        const body: CreateRelRequestBody = {
            name: name,
            toId: secondNode,
            fromId: firstNode,
            direction: direction,
        };

        await fetch(`${HOST}/createRel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }).then(async (res) => {
            if (res.status == 200) {
                const body = await res.json();

                //todo: see the format of a double-sided rel
                console.log("BODY");
                console.log(body);

                //get the response for the updated relationship
                const myRel1 = body as NodeRelationship;

                //search for the relationship on the existing graph and update the value
                updateRelationship(myRel1);

                //success
                return;
            }

            showError("error: " + res.status);
            reset();
        });
    };

    function showError(error: string) {
        setErrorMessage(error);
        setTimeout(() => setErrorMessage(""), ERROR_MESSAGE_TIMEOUT);
    }

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

        showError("name is not set");
    };

    return (
        <React.Fragment>
            {
                // if there is an error (something is not filled out)
                errorMessage != "" && <Error errorMessage={errorMessage}/>
            }

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
