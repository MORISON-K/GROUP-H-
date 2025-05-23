import React from 'react';
import './App.css';
import "boxicons/css/boxicons.min.css";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAuth } from './auth';
import api from './api';
import ManageAndAssignIssues from './pages/ManageAndAssignissues'
import LoadingIndicator from './LoadingIndicator';


// Sidebar Component
const Sidebar = ({ handleLogout, user, onNavClick, activeView }) => {
  return (
    <section id="sidebar">
      <div className="brand">
        <i className="bx bxs-user"></i>
        <span className="text">
  {user ? (
    <div className="user-info">
      <div className="user-name">
        <strong></strong> {user.name || user.username || user.fullName || user.full_name || user.email || 'Unknown'}
      </div>
      {/* {(user.role_id || user.roleId) && (
        <div className="role-id">
          <strong>Role:</strong> {user.role_id || user.roleId}
        </div>
      )} */}
    </div>
  ) : (
    'Profile'
  )}
</span>
      </div>
      
      <ul className="side-menu top p-4">
      <li className={activeView === 'dashboard' ? 'active' : ''}>
         <a href="#!" onClick={() => onNavClick('dashboard')}>
            <i className="bx bxs-dashboard"></i>
            <span className="text">Dashboard</span>
          </a> 
        </li>
        <li className={activeView === 'createIssue' ? 'active' : ''}>
        <a href="#!" onClick={() => onNavClick('createIssue')}>
            <i className="bx bxs-shopping-bag-alt"></i>
            <span className="text">Manage Student Issues.</span>
          </a>
        </li>
        
      
        
      </ul>
      <ul className="side-menu p-4">
        <li>
        <a href="#!" onClick={handleLogout} className="logout">
            <i className="bx bxs-log-out-circle"></i>
            <span className="text">Logout</span>
          </a>
        </li>
      </ul>
    </section>
  );
};

// Recent History

const RecentHistoryTable = () => {
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  useEffect(() => {
    setLoadingIssues(true)
    const fetchRegistrarHistory = async () => {
      try {
        const response = await api.get('/api/issues/history/');
        setIssues(response.data);
        setLoadingIssues(false);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setLoadingIssues(false);
      }
    };
    fetchRegistrarHistory();
  }, []);

  
  // If still loading issues, show spinner
  if (loadingIssues) {
    return (
      <div className="manage-container">
        <LoadingIndicator />
        <span>Your recent history is loading, please wait ...</span>
      </div>
    );
  }

  return (
    <div className="order">
      <div className="head">
        <h3>Recent History</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Course Unit</th>
            <th>Issue Category</th>
            <th>Student ID</th>
            <th>Date Created</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, idx) => (
            <tr key={idx}>
              <td>{issue.course_details?.name || "N/A"}</td>
              <td>{issue.category}</td>
              <td>{issue.student.role_id}</td>
              <td>{new Date(issue.created_at).toLocaleDateString()}</td>
              <td>
                <span className={`status ${issue.status.toLowerCase()}`}>
                  {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};




// Main Content Component (Dashboard view)
const DashboardView = () => (
  <section id="content">
    <main>
      <div className="head-title">
        <div className="left">
          <h1>Welcome Registrar!</h1>
          <ul className="breadcrumb">
            <li>Dashboard</li>
          </ul>
        </div>
      </div>
      <div className="table-data">
        <RecentHistoryTable />
      </div>
    </main>
  </section>
);


// Main RegistrarDashboard Component
const  RegistrarDashboard = () => {
  const auth = useAuth();
  const user = auth.user;
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogout = (e) => {
    e.preventDefault();
    auth.logout();
    window.location.href = '/Login-Page';
  };

  
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'createIssue':
        return <ManageAndAssignIssues />;
      default:
        return <DashboardView />;
    }
  };

  // Check if user is logged in and has a role
  return (
    <div className="admin-hub">
      <Sidebar
        handleLogout={handleLogout}
        user={user}
        onNavClick={setActiveView}
        activeView={activeView}
      />
      {renderContent()}
    </div>
  );
};
export default RegistrarDashboard;
