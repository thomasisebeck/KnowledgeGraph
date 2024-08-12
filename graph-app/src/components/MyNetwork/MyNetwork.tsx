import {Edge, Network, Node} from '@lifeomic/react-vis-network'
import React, {useEffect, useRef, useState} from 'react'
import {GraphType, Direction, ROOT, CLASS} from "../../../../shared/interfaces";
import s from './myNetwork.module.scss'

const options = {
    width: '100%',
    height: '100%',
    interaction: {
        hover: true
    },
    physics: {
        maxVelocity: 20,
        barnesHut: {
            gravitationalConstant: -5000,
            centralGravity: 0.3,
            springLength: 120,
            springConstant: 0.03,
            damping: 0.3,
            avoidOverlap: 0
        },

    },
    nodes: {
        borderWidth: 3,
        color: 'rgb(141,234,255)',
        shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.5)',
            size: 10,
            x: 5,
            y: 5
        },
        font: {
            color: 'white',
        },
        shape: 'dot',
        scaling: {
            min: 15,
            max: 25
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

//for edge thickness
const THICKNESS_MULTIPLIER = 15;
const MINIMUM_THICKNESS = 0.4;

const MyNetwork = ({nodes, relationships, setSelectedEdgeId, setSelectedNodeId} : GraphType) => {

    const [displayLabels, setDisplayLabels] = useState(true);

    //get a reference to the network object
    const networkRef = useRef(null);

    //handle selecting nodes and edges using the network ref
    useEffect(() => {
        if (networkRef.current) {

            //---------- set the state in the parent component, hooks listening -----------//

            // @ts-ignore
            networkRef.current.network.on('selectNode', async (event) => {
                if (event.nodes[0] != null) {
                    //select a node, remove an edge
                    console.log("select node")
                    setSelectedNodeId(event.nodes[0])
                    setSelectedEdgeId(null)
                    return;
                }
            })

            // @ts-ignore
            networkRef.current.network.on('selectEdge', async (event) => {
                //no nodes selected
                if (event.nodes[0] == null)
                    if (event.edges[0] != null) {
                        //select and edge, remove a node
                        console.log("select edge")
                        setSelectedEdgeId(event.edges[0])
                        setSelectedNodeId(null)
                    }
            })
        }
    }, [networkRef])

    //used for scaling the edge widths to that they reach a max size
    const sigmoid = (x: number) => {
        const NUMERATOR = 1.4;
        const X_SCALE_FACTOR = 0.3;
        const Y_SHIFT = -0.4;

        const sig = NUMERATOR / (1 + Math.exp(-x * X_SCALE_FACTOR));
        return sig + Y_SHIFT;
    }

    //get the color of the node based on it's type
    const getColor = (myNode: string, isSnippet?: boolean) => {
        if (isSnippet)
            return '#4f1350'

        switch (myNode) {
            case ROOT:
                return '#a6e68a'
            case CLASS:
                return '#87b66f'
        }
    }

    //get the size of the node based on it's type
    function getValueBaseOnType(n: string) {
        switch (n) {
            case ROOT:
                return 17
            case CLASS:
                return 13
        }
    }

    //separate the string into a multiline block
    function breakUpString(s: string) {
        const MIN_CHARS = 30;

        const broken = [];
        let pos = 0;
        while (s.length > MIN_CHARS && pos != -1) {
            pos = s.indexOf(' ', MIN_CHARS)
            if (pos !== -1)
                broken.push(s.substring(0, pos))
            s = s.substring(pos + 1, s.length);
        }
        broken.push(s);
        return broken;
    }
    //format the labels for information nodes, and remove underscores
    const getNodeLabel = (el: any) => {
        if (!el.isSnippetNode)
            return el.label.replaceAll('_', ' ');

        function getUnderline(label: string) {
            let str = "‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾";
            for (let i = 0; i < label.length; i++) {
                str += '‾'
            }
            return str;
        }

        if (el.snippet != null) {
            console.log(breakUpString(el.snippet));
            return `${el.label.replaceAll('_', ' ')}\n${getUnderline(el.label)}\n${breakUpString(el.snippet).join('\n')}`
        }

        console.error("snipeet is null on snippet node")
    }

    //force rerender when label changes to update
    useEffect(() => {
    }, [displayLabels]);

    return (
        <React.Fragment>
            {/*checkbox for adding link labels or not*/}
            <div className={s.hasLabelsContainer}>
                <label htmlFor={"chk"}>Link labels:</label>
                <input type={"checkbox"} id={"chk"} checked={displayLabels} onChange={(e) => {
                    setDisplayLabels(e.target.checked)
                }}/>
            </div>
            <Network
                options={options}
                ref={networkRef}
            >

                {/*render the nodes*/}
                {
                    nodes && nodes.map(el => {
                            return (
                                <Node
                                    color={el.isSnippetNode ? getColor(el.nodeType, true) : getColor(el.nodeType)}
                                    value={getValueBaseOnType(el.nodeType)}
                                    shape={el.isSnippetNode ? "box" : "dot"}
                                    key={el.nodeId}
                                    id={el.nodeId}
                                    label={getNodeLabel(el)}
                                    margin={el.isSnippetNode ? 10 : 0}
                                />
                            )
                        }
                    )
                }

                {/*render the relationships*/}
                {
                    relationships && relationships.map(r => {
                        const uniqueKey = `[${r.from}]-[${r.relId}]-[${r.to}]-${displayLabels ? '1' : '0'}`;
                        const thickness = (THICKNESS_MULTIPLIER * (sigmoid(r.votes + 1) - 0.5)) + MINIMUM_THICKNESS;
                        const ARROWS = r.direction == Direction.NEUTRAL ? '' : r.direction == Direction.AWAY ? 'to' : 'from'
                        const LABEL = displayLabels ? (r.type?.replaceAll('_', ' ').toLowerCase()) : '';

                        return <Edge id={uniqueKey}
                                     from={r.from}
                                     to={r.to}
                                     label={LABEL}
                                     width={thickness}
                                     arrows={ARROWS}
                                     key={uniqueKey}
                        />
                    })
                }

            </Network>
        </React.Fragment>
    )
}

export default MyNetwork;

