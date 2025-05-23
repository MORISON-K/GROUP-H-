import './App.css';
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from 'react';
import { useAuth } from './auth';
import api from './api';
import IssueSubmissionForm from './IssueSubmission_form';

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

      <ul className="side-menu top">
        <li className={activeView === 'dashboard' ? 'active' : ''}>
          <a href="#!" onClick={() => onNavClick('dashboard')}>
            <i className="bx bxs-dashboard"></i>
            <span className="text">Dashboard</span>
          </a>
        </li>
        <li className={activeView === 'createIssue' ? 'active' : ''}>
          <a href="#!" onClick={() => onNavClick('createIssue')}>
            <i className="bx bxs-shopping-bag-alt"></i>
            <span className="text">Create A New Issue</span>
          </a>
        </li>
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

// Recent history table
const RecentHistoryTable = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentIssues = async () => {
      try {
        const response = await api.get('/api/my-issues/');
        setIssues(response.data);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      }  finally {
        setLoading(false);
      }
    };
    fetchStudentIssues();
  }, []);

   if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',         // Full height of container
          minHeight: '300px',     // Ensures enough space even if parent is small
          width: '100%',          // Full width
          textAlign: 'center',
        }}
      >
        {/* Replace or customize this with your spinner component */}
        <div className="spinner" />
        
        <span>Loading recent history...</span>
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
            <th>Date Created</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, index) => (
            <tr key={index}>
              <td>{issue.course_details?.name || "N/A"}</td>
              <td>{issue.category}</td>
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
          <h1>Welcome Student!</h1>
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

// This is the Main StudentDashboard Component
const StudentDashboard = () => {
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
        return <IssueSubmissionForm />;
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

export default StudentDashboard;
