import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './shared/components/layout/Layout'
import ProtectedRoute from './shared/components/ProtectedRoute'

// Shared pages
import Login from './shared/pages/Login'

// PlayersLog pages
import PLDashboard from './services/playerslog/pages/Dashboard'
import PLGames from './services/playerslog/pages/Games'
import PLLive from './services/playerslog/pages/Live'
import PLSettlements from './services/playerslog/pages/Settlements'
import PLGolls from './services/playerslog/pages/Golls'
import PLUsers from './services/playerslog/pages/Users'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/playerslog/dashboard" replace />} />

        {/* PlayersLog Routes */}
        <Route path="playerslog">
          <Route index element={<Navigate to="/playerslog/dashboard" replace />} />
          <Route path="dashboard" element={<PLDashboard />} />
          <Route path="games" element={<PLGames />} />
          <Route path="live" element={<PLLive />} />
          <Route path="settlements" element={<PLSettlements />} />
          <Route path="golls" element={<PLGolls />} />
          <Route path="users" element={<PLUsers />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
