import { useState } from 'react'
import './App.css'
import MobileLayout from './components/layout/MobileLayout'

function App() {
  const [count, setCount] = useState(0)

  return (
    <MobileLayout>
      <h1>Testing</h1>
    </MobileLayout>
  )
}

export default App
