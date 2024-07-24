import s from './App.module.scss'

import React, {useEffect} from 'react'

import MyNetwork from './components/MyNetwork.jsx'


function App() {

    //fetch the initial data
    useEffect(() => {
        fetch('http://localhost:5000/topicNodes').then(async res => {
            console.log("INITIAL DATA")
            console.log(await res.json());
        })
    }, []);

    return (
        <div className={s.Container}>
            <MyNetwork/>
        </div>
    )
}

export default App
