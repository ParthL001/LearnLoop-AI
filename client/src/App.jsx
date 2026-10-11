import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'

// Pages
import Dashboard from './pages/Dashboard'
import LearningPath from './pages/LearningPath'
import Lessons from './pages/Lessons'
import AITutor from './pages/AITutor'
import Practice from './pages/Practice'
import Assessments from './pages/Assessments'
import Progress from './pages/Progress'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Core Learner Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lessons/:id" element={<Lessons />} />
        <Route path="/tutor" element={<AITutor />} />
        <Route path="/tutor/:id" element={<AITutor />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:id" element={<Practice />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/progress" element={<Progress />} />

        {/* Legal & Compliance Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Legacy & Shortcut Redirects */}
        <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/student/topics" element={<Navigate to="/lessons" replace />} />
        <Route path="/student/tutor/:id" element={<Navigate to="/tutor/:id" replace />} />
        <Route path="/student/progress" element={<Navigate to="/progress" replace />} />
        <Route path="/student/assessments" element={<Navigate to="/assessments" replace />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
