import s from './App.module.scss'

import React, {useEffect, useReducer, useState} from 'react'

import MyNetwork from './components/MyNetwork.js'
import {createRelRequestBody, GraphNode, GraphType, NodeRelationship} from "../../shared/interfaces";
import AddBox from "./components/AddBox";

import plusButton from './images/plusButton.png';
import {AddButtons} from "./components/AddButtons/AddButtons";
import {unstable_batchedUpdates} from "react-dom";

enum AddConnectionPhase {
    NONE,
    FIRST,
    SECOND,
    ADD_BOX
}

const HOST = "http://localhost:5000";

function App() {

    const [nodes, setNodes] = useState<GraphNode[]>()
    const [relationships, setRelationships] = useState<NodeRelationship[]>()
    const [addPhase, setAddPhase] = useState<AddConnectionPhase>(AddConnectionPhase.NONE)
    const [firstNode, setFirstNode] = useState(null)
    const [secondNode, setSecondNode] = useState(null)
    const [clickE, setClickE] = useState(null)


    //fetch the initial data
    useEffect(() => {
        fetch(`${HOST}/topicNodes`).then(async res => {
            const data = await res.json() as GraphType;
            setNodes(data.nodes)
            setRelationships(data.relationships)
            setAddPhase(AddConnectionPhase.NONE)
        })
    }, []);

    useEffect(() => {
        if (clickE != null) {
            //click first node
            if (addPhase == AddConnectionPhase.FIRST) {
                setFirstNode(clickE)
                setAddPhase(AddConnectionPhase.SECOND)
            }

            //click second node
            if (addPhase == AddConnectionPhase.SECOND) {
                console.log("SECOND")
                if (clickE !== firstNode) {
                    setSecondNode(clickE)
                    setAddPhase(AddConnectionPhase.ADD_BOX)
                }
            }
        }
    }, [clickE])

    const clickEvent = (event: any) => {
        setClickE(event.nodes[0]);
    }

    function resetSelectedNodes() {
        setFirstNode(null)
        setSecondNode(null)
    }

    const createConn = () => {
        resetSelectedNodes();
        setAddPhase(AddConnectionPhase.FIRST)
    }

    const reset = () => {
        setAddPhase(AddConnectionPhase.NONE)
        resetSelectedNodes();
    }

    const sendCreateConnApi = async (name: string, doubleSided: boolean) => {
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
                if (res.status == 400) {
                    console.error(res.text())
                }
                if (res.status == 200) {
                    const body = await res.json();
                    console.log(body)
                    const myRel = body[0] as NodeRelationship;

                    unstable_batchedUpdates(() => {

                        //set rel
                        setRelationships(prevState => {
                            if (prevState) {
                                const newRels = prevState;

                                //todo: handle double sided connections

                                for (const rel of newRels) {
                                    if (rel.relId == myRel.relId) {
                                        rel.votes = myRel.votes;
                                        return [...newRels];
                                    }
                                }

                                console.log("ADDING NEW REL")
                                return [myRel, ...newRels]
                            }
                        });

                        reset();
                    })

                    return;

                }

                console.error("error")
                console.error(res.status)
                reset();
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
                {addPhase}
                {addPhase == AddConnectionPhase.FIRST && <p>Click on first node</p>}
                {addPhase == AddConnectionPhase.SECOND && <p>Click on second node</p>}
            </div>

            <div className={s.plus}>
                <AddButtons showAddBox={() => createConn()}/>
            </div>

            {
                addPhase == AddConnectionPhase.ADD_BOX &&
                <AddBox
                    hideAddBox={() => {
                        setAddPhase(AddConnectionPhase.NONE)
                        setFirstNode(null)
                        setSecondNode(null)
                    }}
                    createConnection={sendCreateConnApi}
                />
            }
        </div>
    )
}

export default App
