import { useState } from 'react'
import s from './App.module.scss'
import GraphComponent from "./Graph/Graph.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
      <div className={s.container}>
          <GraphComponent/>
      </div>
  )
}

export default App
