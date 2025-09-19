import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EventProvider } from './contexts/EventContext';
import LoginForm from './components/LoginForm';
import HomePage from './pages/HomePage';
import RealtimeDisplay from './pages/RealtimeDisplay';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EventProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route 
                path="/display" 
                element={
                  <ProtectedRoute>
                    <RealtimeDisplay />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/event/:inviteCode" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </EventProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
