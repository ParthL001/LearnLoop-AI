import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import AppLayout from './components/AppLayout'

// Pages
import LoginSignup from './pages/login_signup'
import Dashboard from './pages/Dashboard'
import ExploreContent from './pages/ExploreContent'
import LearningPath from './pages/LearningPath'
import Lessons from './pages/Lessons'
import AITutor from './pages/AITutor'
import Practice from './pages/Practice'
import Assessments from './pages/Assessments'
import Progress from './pages/Progress'
import About from './pages/About'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'

export default function App() {
  const { user, setUser, logout } = useApp()

  return (
    <Routes>
      {/* Auth Entry Route: First page for users */}
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginSignup onLoginSuccess={setUser} />
        }
      />

      {/* Main Workspace wrapped in AppLayout */}
      <Route
        element={
          user ? (
            <AppLayout user={user} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Default route: Dashboard if logged in, otherwise redirects to /login above */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreContent />} />
        <Route path="/learning-path" element={<Navigate to="/explore" replace />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lessons/:subject" element={<Lessons />} />
        <Route path="/lessons/:subject/:topicId" element={<Lessons />} />
        <Route path="/tutor" element={<AITutor />} />
        <Route path="/tutor/:id" element={<AITutor />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:id" element={<Practice />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/progress" element={<Progress />} />

        {/* Informational & Legal Routes */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Legacy redirects */}
        <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/student/topics" element={<Navigate to="/lessons" replace />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
