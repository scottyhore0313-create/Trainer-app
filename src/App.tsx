import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Drills from './pages/Drills'

const Analyze = lazy(() => import('./pages/Analyze'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-volt-500" />
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/analyze"
            element={
              <Suspense fallback={<PageLoader />}>
                <Analyze />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route path="/drills" element={<Drills />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
