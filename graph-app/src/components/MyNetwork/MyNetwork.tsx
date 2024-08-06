import {Edge, Network, Node} from '@lifeomic/react-vis-network'
import React, {useEffect, useRef, useState} from 'react'
import {GraphType, Direction, ROOT, INFO, CLASS} from "../../../../shared/interfaces";
import s from "./myNetwork.module.scss"
import ReactDOM from "react-dom";
import {node} from "prop-types";

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
            centralGravity: 0.5,
            springLength: 95,
            springConstant: 0.07,
            damping: 0.3,
            avoidOverlap: 0
        },

    },

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

interface snippet {
    snippet: string,
    heading: string
}


const MyNetwork = ({nodes, relationships, clickEvent, expandNode}: GraphType) => {

    const networkRef = useRef(null);
    const [snippet, setSnippet] = useState<snippet | null>(null)
    const [xPos, setXPos] = useState(0);
    const [yPos, setYPos] = useState(0);

    let counter = 0;

    const tryExpand = async (id: string) => {

        if (nodes) {
            for (const node of nodes) {
                if (node.nodeId == id && node.nodeType != INFO) {
                    //add the snippet to the graph
                    // console.log("Calling expand ", + counter++)
                    const res = await expandNode(node);
                    return;
                }
            }
        }

        console.error("could not find node, is it an INFO node?");
    }

    useEffect(() => {
        if (networkRef.current) {
            // @ts-ignore
            networkRef.current.network.on('click', (event) => {
                clickEvent(event);
            })
            // @ts-ignore
            networkRef.current.network.on('selectNode', async (event) => {
                if (event.nodes[0] != undefined) {
                    // console.log("NODES[0]")
                    // console.log(event.nodes[0])
                    await tryExpand(event.nodes[0]);
                } else {
                    console.log("selected node is undefined")
                }
            })
        }
    }, [networkRef])


    const sigmoid = (x: number) => {
        const NUMERATOR = 1.3;
        const X_SCALE_FACTOR = 0.1;
        const Y_SHIFT = -0.05;

        const sig = NUMERATOR / (1 + Math.exp(-x * X_SCALE_FACTOR));
        return sig + Y_SHIFT;
    }

    const getColor = (myNode: string, isSnippet?: boolean) => {
        if (isSnippet)
            return '#4f1350'

        switch (myNode) {
            case ROOT:
                return '#87b66f'
            case CLASS:
                return '#a6e68a'
            case INFO:
                return '#ffffff'
        }
    }

    function getValueBaseOnType(n: string) {
        switch (n) {
            case ROOT:
                return 17
            case CLASS:
                return 11
            case INFO:
                return 8
        }
    }

    return (
        <React.Fragment>
            {
                snippet?.snippet &&
                <div
                    className={s.snippetDialogue} style={{
                    left: xPos - 10,
                    top: yPos - 10
                }}
                >
                    <div className={s.snippetHeading}>
                        {snippet.heading}
                    </div>
                    <div>
                        {snippet.snippet}
                    </div>
                </div>
            }

            <Network
                options={options}
                ref={networkRef}
            >

                {
                    nodes && nodes.map(el => {
                            return (
                                <Node
                                    color={el.isSnippetNode ? getColor(el.nodeType, true) : getColor(el.nodeType)}
                                    value={getValueBaseOnType(el.nodeType)}
                                    shape={el.isSnippetNode ? "box" : "dot"}
                                    key={el.nodeId}
                                    id={el.nodeId}
                                    label={el.label}

                                />
                            )
                        }
                    )
                }

                {
                    relationships && relationships.map(r => {
                        const uniqueKey = `[${r.from}]-[${r.relId}]-[${r.to}]`;
                        const THICKNESS_MULTIPLIER = 15;
                        const MINIMUM_THICKNESS = 0.4;
                        const thickness = (THICKNESS_MULTIPLIER * (sigmoid(r.votes + 1) - 0.5)) + MINIMUM_THICKNESS;
                        const ARROWS = r.direction == Direction.NEUTRAL ? '' : r.direction == Direction.AWAY ? 'to' : 'from'
                        return <Edge id={uniqueKey} from={r.from} to={r.to}
                                     label={r.type != null ? r.type.replaceAll('_', ' ').toLowerCase() : "NULL TYPE"}
                                     width={thickness} arrows={ARROWS} key={uniqueKey}/>
                    })
                }

            </Network>
        </React.Fragment>
    )
}

export default MyNetwork;

