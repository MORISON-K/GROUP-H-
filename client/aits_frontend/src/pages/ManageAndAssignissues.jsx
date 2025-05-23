import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManageAndAssignIssues.css';
import '../App.css';
import LoadingIndicator from '../LoadingIndicator'

const ManageAndAssignIssues = () => {
  const [issues, setIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [lecturers, setLecturers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [loadingIssues, setLoadingIssues] = useState(true)

  // Load all open issues
  useEffect(() => {
    setLoadingIssues(true)
    api.get('/api/issues/workflow/')
      .then(res => setIssues(res.data))
      .catch(err => console.error('Failed to load issues', err))
      .finally(() => setLoadingIssues(false));
  }, []);

  // When an issue is selected, load lecturers for its department
  useEffect(() => {
    if (selectedIssue?.course_details) {
      const deptId = selectedIssue.course_details.department.id;
      api.get('/api/lecturers/', { params: { department: deptId } })
        .then(res => setLecturers(res.data))
        .catch(err => console.error('Failed to load lecturers', err));
    } else {
      setLecturers([]);
    }
  }, [selectedIssue]);

  const handleAssign = e => {
    e.preventDefault();
    if (!selectedIssue || !selectedLecturer) {
      alert('Please select an issue and a lecturer.');
      return;
    }

    // 2-step assign: mark in_progress, then set assigned_to
    api.post(`/api/issues/workflow/${selectedIssue.id}/mark_in_progress/`)
      .then(() =>
        api.patch(`/api/issues/${selectedIssue.id}/`, { assigned_to: selectedLecturer })
      )
      .then(() => {
        setIssues(prev =>
          prev.map(i =>
            i.id === selectedIssue.id
              ? { ...i, status: 'in_progress', assigned_to: { id: selectedLecturer } }
              : i
          )
        );
        alert(`Issue "${selectedIssue.category}" assigned.`);
        setSelectedIssue(null);
        setSelectedLecturer('');
      })
      .catch(err => {
        console.error('Assignment failed', err);
        alert('Failed to assign issue.');
      });
  };

  const getStatusClass = status => {
    switch (status) {
      case 'open':        return 'status-pending';
      case 'in_progress': return 'status-assigned';
      case 'resolved':    return 'status-resolved';
      default:            return '';
    }
  };

  // If an issue is selected, show only the assignment panel
  if (selectedIssue) {
    return (
      <div className="assignment-panel">
        <h3>Assign Issue to Lecturer</h3>
        <div className="issue-details">
          <div className="detail-item">
            <span className="detail-label">Year:</span>
            <span className="detail-value">{selectedIssue.year_of_study}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Semester:</span>
            <span className="detail-value">{selectedIssue.semester}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Issue Category:</span>
            <span className="detail-value">{selectedIssue.category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Student Role ID:</span>
            <span className="detail-value">{selectedIssue.student.role_id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Course Unit:</span>
            <span className="detail-value">{selectedIssue.course_details.name}</span>
          </div>
        </div>

        <form onSubmit={handleAssign} className="assignment-form">
          <div className="form-group">
            <label className="form-label">
              Assign To Lecturer:
              <select
                className="form-select"
                value={selectedLecturer}
                onChange={e => setSelectedLecturer(e.target.value)}
                required
              >
                <option value="">-- Select a Lecturer --</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.first_name} {lecturer.last_name} – {lecturer.department.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setSelectedIssue(null);
                setSelectedLecturer('');
              }}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Assign Issue
            </button>
          </div>
        </form>
      </div>
    );
  }

  
  // If still loading issues, show spinner
 if (loadingIssues) {
  return (
    <div
      id="assign"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
       
      }}
    >
      <LoadingIndicator />
      <span >Issues loading, please wait ...</span>
    </div>
  );
}


  // Otherwise, show list + filters
  return (
    <div className="manage-container" id="assign">
      <div className="page-header">
        <h2 id="assignh2">Manage and Assign Student Issues</h2>
        <div className="filter-container">
          <label className="filter-label">
            Filter by Status:
            <select
              className="filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="open">Pending</option>
              <option value="in_progress">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
        </div>
      </div>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Issue Category</th>
              <th>Issue Description</th>
              <th>Student Role ID</th>
              <th>Course</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues
              .filter(issue => filterStatus === 'All' || issue.status === filterStatus)
              .map(issue => (
                <tr key={issue.id}>
                  <td>{issue.id}</td>
                  <td>{issue.year_of_study}</td>
                  <td>{issue.semester}</td>
                  <td>{issue.category}</td>
                  <td>{issue.description}</td>
                  <td>{issue.student.role_id}</td>
                  <td>{issue.course_details.name}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td>
                    {issue.status === 'open' && (
                      <button
                        className="action-button assign-button"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAndAssignIssues;
