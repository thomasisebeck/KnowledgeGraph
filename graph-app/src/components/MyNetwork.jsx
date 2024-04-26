import React, { Component , createRef} from "react";
import { Network, Node, Edge } from "@lifeomic/react-vis-network";

export default class MyNetwork extends Component {
    constructor(props) {
        super(props);
        this.networkComponent = createRef();
    }

    componentDidMount() {
        this.networkComponent.current.network.on("click", event => {
            console.log("clicked", event);
        });
    }

    render() {
        return (
            <Network
                options={{ width: "100%", height: "300px" }}
                ref={this.networkComponent}
            >
                <Node id="vader" label="Darth Vader" />
                <Node id="luke" label="Luke Skywalker" />
                <Node id="leia" label="Leia Organa" />
                <Edge id="1" from="vader" to="luke" label={"associated with"}/>
                <Edge id="2" from="vader" to="leia" />
            </Network>
        );
    }
}