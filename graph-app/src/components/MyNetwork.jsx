import { Edge, Network, Node } from '@lifeomic/react-vis-network'
import React, {Component, createRef, useEffect, useRef} from 'react'

const MyNetwork = () => {

    const networkRef = useRef(null);

    useEffect(() => {
        if (networkRef.current) {
            networkRef.current.network.on('click', (event) => {
                console.log('clicked', event)
            });
        }
    })

    return (
      <Network
        options={{ width: '100%', height: '100%' }}
        ref={networkRef}>
        <Node id="pets" label="pets" />
        <Node id="dogs" label="dogs" />
        <Node id="collars" label="collars" />
        <Edge
          id="pets-dogs"
          from="pets"
          to="dogs"
          label={'subset'}
          arrows={'to'}
        />
      </Network>
    )
}

export default MyNetwork;
