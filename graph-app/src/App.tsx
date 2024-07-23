import s from './App.module.scss'

import React, {useEffect} from 'react'

import MyNetwork from './components/MyNetwork.jsx'


function App() {

    //fetch the initial data
    useEffect(() => {
        const fetchData = async () => {
           try {
               console.log("FETCHING TOPIC NODES")
               const response = await fetch('http://localhost:3001/topicNodes');
               if (response.ok) {
                   console.log("DATA")
                   const data = await response.json();
                   console.log(data);
               } else {
                   console.log("error")
                   console.log(response.status);
               }

           } catch (e) {
               console.error(e);
           }
        }

        fetchData();

    }, []);

    return (
        <div className={s.Container}>
            <MyNetwork/>
        </div>
    )
}

export default App
