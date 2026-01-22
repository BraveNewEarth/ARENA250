import { useGameStore } from './store/useGameStore'
import { MissionControl } from './components/MissionControl'
import { CharacterSelect } from './components/CharacterSelect'

function App() {
  const { gameStarted } = useGameStore()

  return gameStarted ? <MissionControl /> : <CharacterSelect />
}

export default App
