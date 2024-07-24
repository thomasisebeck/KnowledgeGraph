import { Edge, Network, Node } from '@lifeomic/react-vis-network'
import React, {Component, createRef, useEffect, useRef} from 'react'
import PropTypes from "prop-types";
import {GraphType} from "../interfaces";

const MyNetwork = ({nodes, relationships} : GraphType) => {

    const networkRef = useRef(null);

    useEffect(() => {
        if (networkRef.current) {
            // @ts-ignore
            networkRef.current.network.on('click', (event) => {
                console.log('clicked', event)
            });
        }

        console.log("PROPS")
        console.log(nodes)
    }, [networkRef])

    return (
      <Network
        options={{ width: '100%', height: '100%' }}
        ref={networkRef}>

          {
              nodes && nodes.map(el => {
                  //todo: scaling doesn't work
                  return <Node scaling={{min: 100, max: 20}} shadow={true} shape="circle" key={el.nodeId} id={el.nodeId} label={el.label} />
              })
          }

        {/*<Edge*/}
        {/*  id="pets-dogs"*/}
        {/*  from="pets"*/}
        {/*  to="dogs"*/}
        {/*  label={'subset'}*/}
        {/*  arrows={'to'}*/}
        {/*/>*/}
      </Network>
    )
}

export default MyNetwork;

