import s from './App.module.scss'

import React from 'react'

import MyNetwork from './components/MyNetwork.jsx'

function App() {
  return (
    <div className={s.Container}>
      <MyNetwork />
    </div>
  )
}

export default App
