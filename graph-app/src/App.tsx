import s from './App.module.scss'

import React, {useEffect, useReducer, useState} from 'react'

import MyNetwork from './components/MyNetwork.js'
import {createRelRequestBody, GraphNode, GraphType, NodeRelationship} from "./interfaces";
import AddBox from "./components/AddBox";

import plusButton from './images/plusButton.png';
import {AddButtons} from "./components/AddButtons/AddButtons";

enum AddConnectionPhase  {
    NONE,
    FIRST,
    SECOND,
    ADD_BOX
}

const HOST = "http://localhost:5000";

function App() {

    const [nodes, setNodes] = useState<GraphNode[]>()
    const [relationships, setRelationships] = useState<NodeRelationship[]>()

    const [firstNode, setFirstNode]= useState<any>(null)
    const [secondNode, setSecondNode]= useState<any>(null)
    let [addPhase, setAddPhase] = useState(AddConnectionPhase.NONE)

    //fetch the initial data
    useEffect(() => {
        fetch(`${HOST}/topicNodes`).then(async res => {
            const data = await res.json() as GraphType;
            setNodes(data.nodes)
            setRelationships(data.relationships)
            console.log(data)
        })
    }, []);

    const updateAddPhase = (newState: AddConnectionPhase) => {
        setAddPhase(newState);
        addPhase = newState;
    }

    const clickEvent = (event:any) => {

        console.log("add phase", addPhase);
        //click second node
        if (addPhase == AddConnectionPhase.SECOND) {
            if (event.nodes.length == 1) {
                //check that it's not the same node
                if (event.nodes[0] != firstNode) {
                    //set the second node
                    setSecondNode(event.nodes[0]);
                    updateAddPhase(AddConnectionPhase.ADD_BOX);
                }
            }
        }

        //click first node
        if (addPhase == AddConnectionPhase.FIRST) {
            console.log("HERE")
            if (event.nodes.length == 1) {
                //success, move to next stage
                setFirstNode(event.nodes[0])
                updateAddPhase(AddConnectionPhase.SECOND)
            }
        }
    }

    const createConn = () => {
        updateAddPhase(AddConnectionPhase.FIRST)
        setFirstNode(null)
        setSecondNode(null)
    }

    const sendCreateConnApi = async (name: string, doubleSided: boolean) => {
        if (firstNode == null || secondNode == null) {
            console.log("First or second is null")
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
        }).then(async res => {
            if (res.status == 400) {
                console.error(res.text())
            }
            const body = await res.json();
            console.log("FRONTEND")
            console.log(body)
        })


    }

    return (
        <div className={s.Container}>
            {
                nodes && relationships &&
                <MyNetwork
                    nodes={nodes}
                    relationships={relationships}
                    clickEvent={clickEvent}
                />
            }

            <div className={s.CreateConnectionContainer}>
                { addPhase == AddConnectionPhase.FIRST && <p>Click on first node</p> }
                { addPhase == AddConnectionPhase.SECOND && <p>Click on second node</p> }
            </div>

            <div className={s.plus}>
                <AddButtons showAddBox={() => createConn()} />
            </div>

            {
                addPhase == AddConnectionPhase.ADD_BOX &&
                <AddBox hideAddBox={() => {
                    updateAddPhase(AddConnectionPhase.NONE);
                    setFirstNode(null)
                    setSecondNode(null)
                }}
                createConnection={sendCreateConnApi}/>
            }
        </div>
    )
}

export default App
