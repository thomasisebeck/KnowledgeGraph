import React from 'react';
import { createRelRequestBody, NodeRelationship } from '../../../shared/interfaces';
import Dialogue from "./Dialogue/Dialogue";
import {HOST} from "../../../shared/variables"

//dialogue to add a connection between two nodes
function AddConnectionDialogue({hideAddBox, firstNode, secondNode, reset, updateRelationship}: {
    hideAddBox: () => void,
    firstNode: string | null,
    secondNode: string | null,
    reset: () => void,
    updateRelationship: (myRel1:NodeRelationship) => void
}) {

    const nameRef = React.useRef<HTMLInputElement | null>(null);
    const checkRef = React.useRef<HTMLInputElement | null>(null);
    const [message, setMessage] = React.useState('');
    //function to send an api request to create a connection
    const createConnection = async (name: string, doubleSided: boolean) => {
        if (firstNode == null || secondNode == null) {
            console.log("First or second is null")
            reset();
            return;
        }

        const body: createRelRequestBody = {
            name: name,
            toId: secondNode,
            fromId: firstNode,
            doubleSided: doubleSided
        }

        console.log(body);

        await fetch(`${HOST}/createRel`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(async res => {
                if (res.status == 200) {
                    const body = await res.json();

                    //todo: see the format of a double-sided rel
                    console.log("BODY")
                    console.log(body)

                    //get the response for the updated relationship
                    const myRel1 = body as NodeRelationship;

                    //search for the relationship on the existing graph and update the value
                    updateRelationship(myRel1);

                    //success
                    return;
                }

                console.error("error")
                console.error(res.status)
                reset();
            })

    }

    const tryCreateConnection = () => {
        if (nameRef.current != null && checkRef.current != null) {
            if (nameRef.current.value != "") {
                const name = nameRef.current.value;
                const isDoubleSided = checkRef.current.checked;
                createConnection(name, isDoubleSided);
                return;
            }
            setMessage("name is not set")
        }
    }

    return (
        <Dialogue hideDialogue={hideAddBox} title={"Create Connection"}>
            <div>
                <label>Name the connection:</label>
                <input type={"text"} ref={nameRef}/>
            </div>
            <div>
                <label>Double sided:</label>
                <input type={"checkbox"} ref={checkRef}/>
            </div>
            <button onClick={tryCreateConnection}>Create</button>
        </Dialogue>
    )

}

export default AddConnectionDialogue;