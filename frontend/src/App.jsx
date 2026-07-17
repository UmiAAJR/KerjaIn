import { useState } from 'react'
import './App.css'
import MobileLayout from './components/layout/MobileLayout'
import { Rocket } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <MobileLayout>
      <Rocket />
    </MobileLayout>
  )
}

export default App
