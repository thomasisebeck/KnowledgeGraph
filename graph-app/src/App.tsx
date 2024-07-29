import s from './App.module.scss'

import React, {useEffect, useReducer, useState} from 'react'

import MyNetwork from './components/MyNetwork.js'
import {GraphNode, GraphType, NodeRelationship} from "./interfaces";
import AddBox from "./components/AddBox";

import plusButton from './images/plusButton.png';
import {AddButtons} from "./components/AddButtons/AddButtons";


const enum AddConnectionStage {
    NONE,
    CLICK_FIRST,
    CLICK_SECOND,
    ADD_BOX
}

function App() {

    const [nodes, setNodes] = useState<GraphNode[]>()
    const [relationships, setRelationships] = useState<NodeRelationship[]>()

    const [firstNode, setFirstNode]= useState<any>(null)
    const [secondNode, setSecondNode]= useState<any>(null)
    const [message, setMessage] = useState("initial message")
    const [showAddBox, setShowAddBox] = useState(false);

    let messageState = AddConnectionStage.NONE;

    //fetch the initial data
    useEffect(() => {
        fetch('http://localhost:5000/topicNodes').then(async res => {
            const data = await res.json() as GraphType;
            setNodes(data.nodes)
            setRelationships(data.relationships)
            console.log(data)
        })
    }, []);



    const clickEvent = (event:any) => {

        //click node 2 > show dialogue
        if (messageState == AddConnectionStage.CLICK_SECOND) {
            if (event.nodes.length == 1) {
                //check that it's not the same node
                if (event.nodes[0] != firstNode) {
                    //set the second node
                    setSecondNode(event.nodes[0]);
                    setMessage("Done!")
                    setShowAddBox(true)
                }
            }
        }

        //click node 1 > show click node 2
        if (messageState == AddConnectionStage.CLICK_FIRST) {
            if (event.nodes.length == 1) {
                //success, move to next stage
                setFirstNode(event.nodes[0])
                setMessage("click on second node")
                messageState = AddConnectionStage.CLICK_SECOND;
            }
        }
    }

    const createConn = () => {
        setMessage("click on first node")
        messageState = AddConnectionStage.CLICK_FIRST;
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
                <p>{message}</p>
            </div>

            <div className={s.plus}>
                <AddButtons showAddBox={() => createConn()} />
            </div>

            {
                showAddBox &&
                <AddBox hideAddBox={() => setShowAddBox(false)} />
            }
        </div>
    )
}

export default App
