import s from './App.module.scss'

import React, {useEffect} from 'react'

import MyNetwork from './components/MyNetwork.jsx'


function App() {

    //fetch the initial data
    useEffect(() => {
        fetch('/initialData').then(res => {
            console.log("INITIAL DATA")
            console.log("FETCHING TOPIC NODES")
            console.log(res);
        })
    }, []);

    return (
        <div className={s.Container}>
            <MyNetwork/>
        </div>
    )
}

export default App
