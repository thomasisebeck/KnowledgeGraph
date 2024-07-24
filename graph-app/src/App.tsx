import s from './App.module.scss'

import React, {useEffect, useState} from 'react'

import MyNetwork from './components/MyNetwork.js'
import {GraphNode, GraphType, NodeRelationship} from "./interfaces";


function App() {

    const [nodes, setNodes] = useState<GraphNode[]>()
    const [relationships, setRelationships] = useState<NodeRelationship[]>()

    //fetch the initial data
    useEffect(() => {
        fetch('http://localhost:5000/topicNodes').then(async res => {
            const data = await res.json() as GraphType;
            setNodes(data.nodes)
            setRelationships(data.relationships)
            console.log(data)
        })
    }, []);

    return (
        <div className={s.Container}>
            {
                nodes && relationships &&
                <MyNetwork
                    nodes={nodes}
                    relationships={relationships}
                />
            }
        </div>
    )
}

export default App
