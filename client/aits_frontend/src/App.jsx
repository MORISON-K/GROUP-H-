// App.jsx
import React from 'react';
import Login from './Login';
import Register from './Register';
import './App.css';
import IssueSubmission_form from './IssueSubmission_form';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import RegistrarDashboard from './RegistrarDashboard';
import LecturerDashboard from './LecturerDashboard';
import { AuthProvider, AuthContext } from './auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <nav className="nav-bar">
            <button className="nav-button" onClick={() => window.location.href = '/'}> Home </button>
          </nav>
          <Routes>
            <Route path="/" element={
              <AuthContext.Consumer>
                {({ currentPage, handlePageChange, user }) => (
                  currentPage === 'welcome' ? (
                    <div className="welcome-page">
                      <img src="/muk_logo.jpeg" alt="Logo not found" />
                      <h1>Welcome to Academic Issue Tracking System</h1>
                      <div className="button-container">
                        <button className="register-button" onClick={() => handlePageChange('register')}> Register </button>
                        <button className="login-button" onClick={() => handlePageChange('login')}> Login </button>
                        {/* <button className='issue-button' onClick={() => handlePageChange('issueSubmission')}> Create New Issue </button> */}
                      </div>
                    </div>
                  ) : currentPage === 'login' ? (
                    <Login handlePageChange={handlePageChange} />
                  ) : currentPage === 'register' ? (
                    <Register handlePageChange={handlePageChange} />
                  ) : currentPage === 'issueSubmission' ? (
                    <IssueSubmission_form />
                  ) : null
                )}
              </AuthContext.Consumer>
            } />
            <Route path="/dashboard" element={
              <AuthContext.Consumer>
                {({ user }) => (
                  user && user.role === 'academic_registrar' ? (
                    <RegistrarDashboard />
                  ) : user && user.role === 'lecturer' ? (
                    <LecturerDashboard />
                  ) : (
                    <StudentDashboard />
                  )
                )}
              </AuthContext.Consumer>
            } />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
            <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />

            <Route path="/IssueSubmission-Page" element={<IssueSubmission_form />} />
            <Route path="/Register-Page" element={<Register />} />
            <Route path="/Login-Page" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
