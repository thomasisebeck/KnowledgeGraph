import { Edge, Network, Node } from '@lifeomic/react-vis-network'
import React, {useEffect, useRef} from 'react'
import {GraphType} from "../../../../shared/interfaces";

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
    },
    edges: {
        font: {
            color: '#dfdfdf',
            strokeWidth: 0,
            size: 16,
            face: 'courier'
        },
        color: {
            color: '#8f7851',
            highlight: '#bfa684'
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


    const sigmoid = (x : number) => {
        const STRETCH_FACTOR = 10;
        return 1 / (1 + Math.exp(-x / STRETCH_FACTOR));
    }

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
                  const THICKNESS_MULTIPLIER = 15;
                  const MINIMUM_THICKNESS = 0.4;

                  const thickness = (THICKNESS_MULTIPLIER * (sigmoid(r.votes + 1) - 0.5)) + MINIMUM_THICKNESS;
                  const ARROWS = r.doubleSided ? 'to from' : 'to'
                  return <Edge id={uniqueKey} from={r.from} to={r.to} label={r.type.replace('_', ' ').toLowerCase()} width={thickness} arrows={ARROWS} key={uniqueKey} />
              })
          }

      </Network>
    )
}

export default MyNetwork;

