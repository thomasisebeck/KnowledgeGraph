import { Network, Node, Edge } from '@lifeomic/react-vis-network';
import s from './myNetwork.module.scss'

const Decorator = ({label}) => {
    return (
        <div
            onClick={() => console.log(`You clicked ${label}`)}
            style={s.button}
        >
            Click Me
        </div>
    );
};

export default function MyNetwork () {
    function logMe(label) {
        console.log(label);
    }

    return (
        <Network>
            <Node id="vader" label="Darth Vader" color="white" onclick={() => logMe("Darth Vader")}/>
            <Node id="luke" label="Luke Skywalker" decorator={Decorator}/>
            <Node id="leia" label="Leia Organa" decorator={Decorator}/>
            <Edge id="1" from="vader" to="luke"  label={"hello"}decorator={Decorator}/>
            <Edge id="2" from="vader" to="leia" decorator={Decorator}/>
        </Network>
    )
}