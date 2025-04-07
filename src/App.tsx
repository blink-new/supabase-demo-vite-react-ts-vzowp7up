
import { Header } from './components/Header'
import { TaskDashboard } from './components/TaskDashboard'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TaskDashboard />
      </main>
    </div>
  )
}

export default App