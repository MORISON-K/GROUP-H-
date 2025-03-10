import React from 'react';
import { Link } from 'react-router-dom';
import "boxicons/css/boxicons.min.css";  // Import Boxicons for the icons


// Sidebar Component
const Sidebar = () => {
  return (
    <section id="sidebar" className="bg-gray-800 text-white w-64 min-h-screen">
      <Link to="/profile" className="brand flex items-center p-4 text-xl">
        <i className="bx bxs-user text-2xl"></i>
        <span className="ml-3 text-white">Registrar Profile</span>
      </Link>
      <ul className="side-menu top p-4">
        <li className="active">
          <Link to="/registrar-dashboard" className="flex items-center p-3 text-white hover:bg-gray-700">
            <i className="bx bxs-dashboard text-xl mr-3"></i>
            <span className="text-lg">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/ManageIssues" className="flex items-center p-3 text-white hover:bg-gray-700">
            <i className="bx bxs-folder-open text-xl mr-3"></i>
            <span className="text-lg">Manage Student Issues</span>
          </Link>
        </li>
      
        
        <li>
          <Link to="/AssignIssue" className="flex items-center p-3 text-white hover:bg-gray-700">
            <i className="bx bxs-user-check text-xl mr-3"></i>
            <span className="text-lg">Assign an Issue</span>
          </Link>
        </li>
      </ul>
      <ul className="side-menu p-4">
        <li>
          <Link to="/logout" className="logout flex items-center p-3 text-white hover:bg-gray-700">
            <i className="bx bxs-log-out-circle text-xl mr-3"></i>
            <span className="text-lg">Logout</span>
          </Link>
        </li>
      </ul>
    </section>
  );
};



// Content Component
const Content = () => {
  return (
    <section id="content" className="bg-gray-50 p-6 rounded-lg flex-1">
      <main>
        {/* Header Section */}
        <div className="head-title flex justify-between items-center mb-6">
          <div className="left">
            <h1 className="text-2xl font-bold text-gray-800">Welcome, Registrar!</h1>
            <ul className="breadcrumb text-sm text-gray-600">
              <li>
                <Link to="/registrar-dashboard">Dashboard</Link>
              </li>
              <li>
                <i className="bx bx-chevron-right text-gray-500"></i>
              </li>
            </ul>
          </div>
          {/* User Avatar */}
          <div className="right">
            <i className="bx bxs-user-circle text-4xl text-gray-600"></i>
          </div>
        </div>

        {/* Recent Updates Section */}
        <div className="recent-updates mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Updates</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600">No recent updates yet. Keep track of your tasks!</p>
          </div>
        </div>
      </main>
    </section>
  );
};



// Main RegistrarDashboard Component
const RegistrarDashboard = () => {
  return (
    <div className="admin-hub flex">
      <Sidebar />
      <Content />
    </div>
  );
};

export default RegistrarDashboard;
