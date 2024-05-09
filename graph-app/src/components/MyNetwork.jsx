import { Edge, Network, Node } from '@lifeomic/react-vis-network'
import React, { Component, createRef } from 'react'

export default class MyNetwork extends Component {
  constructor(props) {
    super(props)
    this.networkComponent = createRef()
  }

  componentDidMount() {
    this.networkComponent.current.network.on('click', (event) => {
      console.log('clicked', event)
    })
  }

  render() {
    return (
      <Network
        options={{ width: '100%', height: '100%' }}
        ref={this.networkComponent}>
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
}
