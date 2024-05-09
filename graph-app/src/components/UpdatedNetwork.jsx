import {Component} from "react";
import { Network, Node, Edge } from 'react-vis-network';

export default class UpdatedNetwork extends Component {
    render() {
        return (
            <Network>
                <Node id="vader" label="Darth Vader" />
                <Node id="luke" label="Luke Skywalker" />
                <Node id="leia" label="Leia Organa" />
                <Edge id="1" from="vader" to="luke" />
                <Edge id="2" from="vader" to="leia" />
            </Network>
        );
    }
}