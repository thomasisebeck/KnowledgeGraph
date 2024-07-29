import { Edge, Network, Node } from '@lifeomic/react-vis-network'
import React, {useEffect, useRef} from 'react'
import {GraphType} from "../../../shared/interfaces";

const options= {
    width: '100%',
    height: '100%',
    nodes: {
        borderWidth: 2,
        color: 'rgb(141,234,255)',
        shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.5)',
            size: 10,
            x: 5,
            y: 5
        },
        font: {
            color: 'white'
        },
        shape: 'dot',
        scaling:{
            min: 10,
            max: 30
        }
    }
}

const MyNetwork = ({nodes, relationships, clickEvent} : GraphType) => {

    const networkRef = useRef(null);

    useEffect(() => {
        if (networkRef.current) {
            // @ts-ignore
            networkRef.current.network.on('click', (event) => {
                clickEvent(event);
            })
        }
    }, [networkRef])

    return (
      <Network
        options={options}
        ref={networkRef}>

          {
              nodes && nodes.map(el => {
                  //todo: scaling doesn't work
                  return <Node color={'orange'} value={100} key={el.nodeId} id={el.nodeId} label={el.label} />
              })
          }

          {
              relationships && relationships.map(r => {
                  //todo: check if double sided and set arrows accordingly
                  const uniqueKey = `[${r.from}]-[${r.relId}]-[${r.to}]`;
                  return <Edge id={uniqueKey} from={r.from} to={r.to} label={r.type}  arrows={'to'} key={uniqueKey}/>
              })
          }

      </Network>
    )
}

export default MyNetwork;

