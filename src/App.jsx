import { useState, useEffect } from 'react'
import Experience from './Experience/Experience'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [contentRevealed, setContentRevealed] = useState(false)
  const experience = new Experience()

  useEffect(() => {
    if (darkMode === false) {
      experience.lightMode()
    }
    if (darkMode === true) {
      experience.darkMode()
    }
  }, [darkMode])

  useEffect(() => {
    if (contentRevealed === false) {
      experience.pointerCancelRadius()
    }
    if (contentRevealed === true) {
      experience.pointerDownRadius()
    }
  }, [contentRevealed])

  const handleReveal = () => {
    setContentRevealed(!contentRevealed)
  }

  const handleClick = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={darkMode === false ? 'App light-mode' : 'App dark-mode'}>
      <div className='title'>
        <h1>String waves</h1>
        <button onClick={handleReveal}>click to {contentRevealed === false ? 'reveal' : 'hide'} content</button>
      </div>
      <div className='text'>
        <h2>Undulating strings built in Three.js. Move your mouse around or touch your screen to play with the waves</h2>
      </div>
      <div className='bottom'>
        <p >visit portfolio at <a className='textButton' href='http://emiliegauvin.com/' target="_blank"><i>emiliegauvin.com</i></a></p>
        <button onClick={handleClick}>{darkMode === false ? 'Switch to dark mode' : 'Switch to light mode'}</button>
      </div>
    </div>
  )
}

export default App
