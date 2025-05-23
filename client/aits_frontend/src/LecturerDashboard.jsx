import React from 'react';
import './App.css';
import "boxicons/css/boxicons.min.css";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAuth } from './auth';
import api from './api';

const getStatusClass = (status) =>
  status === "resolved" ? "resolved" : "assigned";

// Sidebar Components
const Sidebar = ({ handleLogout, user, activeComponent, setActiveComponent }) => {
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
        <li className={activeComponent === 'dashboard' ? 'active' : ''}>
          <a href="#!" onClick={() => setActiveComponent('dashboard')}>
            <i className="bx bxs-dashboard"></i>
            <span className="text">Dashboard</span>
          </a>
        </li>
        <li className={activeComponent === 'assignedIssues' ? 'active' : ''}>
          <a href="#!" onClick={() => setActiveComponent('assignedIssues')}>
            <i className="bx bxs-folder-open text-xl mr-3"></i>
            <span className="text">View And Resolve Issues</span>
          </a>
        </li>
      </ul>
      <ul className="side-menu">
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

// Dashboard Component
const Dashboard = () => {
  return (
    <div>
      <div className="head-title">
        <div className="left">
          <h1>Welcome Lecturer!</h1>
          <ul className="breadcrumb">
            <li>
              <a href="#!">Dashboard</a>
            </li>
            <li>
              <i className="bx bx-chevron-right"></i>
            </li>
          </ul>
        </div>
      </div>
      <div className="table-data">
        <RecentHistoryTable />
      </div>
    </div>
  );
};

// AssignedIssues Component
// AssignedIssues Component
const AssignedIssues = () => {
  const [issues, setIssues] = useState([]);
  
  useEffect(() => {
    api
      .get("/api/issues/assigned/")
      .then((res) => {
        setIssues(res.data);
      })
      .catch((err) => console.error("Error loading assigned issues:", err));
  }, []);
  
  return (
    <div className="assigned-issues">
      <div className="head-title">
        <div className="left">
          <h1>Assigned Issues</h1>
        </div>
      </div>
      <div className="app-container assigned-issues">
        <div className="table-container">
          <div className="head">
            <h3>Issues to Resolve</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th className="AssignedIssues-th">Course Unit</th>
                <th className="AssignedIssues-th">Student Role ID</th>
                <th className="AssignedIssues-th">Category</th>
                <th className="AssignedIssues-th">Date Created</th>
                <th className="AssignedIssues-th">Status</th>
                <th className="AssignedIssues-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="AssignedIssues-td">{issue.course_details?.name || "N/A"}</td>
                  <td className="AssignedIssues-td">{issue.student?.role_id || "N/A"}</td>
                  <td className="AssignedIssues-td">{issue.category}</td>
                  <td className="AssignedIssues-td">
                    {issue.created_at
                      ? new Date(issue.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="AssignedIssues-td">
                    <span className={`status ${issue.status}`}>
                      {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                  </td>
                  <td className="AssignedIssues-td">
                    {issue.status === 'in_progress' && (
                      <button 
                        className="resolve-btn"
                        onClick={() => handleResolveIssue(issue.id)}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function handleResolveIssue(issueId) {
    api
      .post(`/api/issues/${issueId}/resolve/`)
      .then(() => {
        // Update the issues list after resolving
        setIssues(issues.map(issue => 
          issue.id === issueId 
            ? {...issue, status: 'resolved'} 
            : issue
        ));
      })
      .catch((err) => console.error("Error resolving issue:", err));
  }
};


// Recent History Table Component
const RecentHistoryTable = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api
      .get("/api/issues/assigned/")
      .then((res) => {
        // Assuming res.data is an array of issues, some with status 'assigned' and some 'resolved'
        setHistory(res.data);
      })
      .catch((err) => console.error("Error loading history:", err));
  }, []);

  return (
    <div className="order">
      <div className="head">
        <h3>Issue History</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Course Unit</th>
            <th>Student Role ID</th>
            <th>Category</th>
            <th>Date Created</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row) => (
            <tr key={row.id}>
              <td>{row.course_details?.name || "N/A"}</td>
              <td>{row.student?.role_id || "N/A"}</td>
              <td>{row.category}</td>
              <td>
                {row.created_at
                  ? new Date(row.created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td>
                <span className={`status ${getStatusClass(row.status)}`}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Content Component
const Content = ({ activeComponent }) => {
  return (
    <section id="content">
      <main>
        {activeComponent === 'dashboard' && <Dashboard />}
        {activeComponent === 'assignedIssues' && <AssignedIssues />}
      </main>
    </section>
  );
};

// Main LecturerDashboard Component
const LecturerDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('dashboard');
  
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/Login-Page');
  };

  return (
    <div className="admin-hub">
      <Sidebar 
        handleLogout={handleLogout} 
        user={user} 
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <Content activeComponent={activeComponent} />
    </div>
  );
};

export default LecturerDashboard;
