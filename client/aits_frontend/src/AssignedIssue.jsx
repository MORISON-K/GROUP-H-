import React, { useState, useEffect } from "react";
import api from "./api";

const getStatusClass = status => {
  switch (status) {
    case 'open':        return 'status-pending';
    case 'in_progress': return 'status-assigned';
    case 'resolved':    return 'status-resolved';
    default:            return '';
  }
};


const AssignedIssues = () => {
  const [issues, setIssues] = useState([]);

  // 1) load my assigned issues on mount
  useEffect(() => {
    api.get('/issues/assigned/')
      .then(res => setIssues(res.data))
      .catch(err => console.error("Failed to load assigned issues:", err));
  }, []);

  // 2) resolve handler
  const handleResolve = (issueId) => {
    api.post(`/issues/workflow/${issueId}/resolve/`)
      .then(() => {
        setIssues(prev =>
          prev.map(i =>
            i.id === issueId
              ? { ...i, status: 'resolved' }
              : i
          )
        );
      })
      .catch(err => {
        console.error("Failed to resolve issue:", err);
        alert("Could not resolve issue. Try again.");
      });
  };

  return (
    <div className="assigned-issues">
      <h1>Assigned Issues</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th scope="col" className="AssignedIsues-th">Issue ID</th>
              <th scope="col" className="AssignedIsues-th">Course Unit</th>
              <th scope="col" className="AssignedIsues-th">Student Role ID</th>
              <th scope="col" className="AssignedIsues-th">Issue Category</th>
              <th scope="col" className="AssignedIsues-th">Issue Description</th>
              <th scope="col" className="AssignedIsues-th">Date Created</th>
              <th scope="col" className="AssignedIsues-th">Action</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((row, idx) => (
              <tr key={idx}>
                <td className="AssignedIsues-td">{row.id}</td>
                <td className="AssignedIsues-td">{row.course_details?.name || 'N/A'}</td>
                <td className="AssignedIsues-td">{row.student.role_id}</td>
                <td className="AssignedIsues-td">{row.category}</td>
                <td className="AssignedIsues-td">{row.description}</td>
                <td className="AssignedIsues-td">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
                <td className="AssignedIsues-td">
                  {row.status !== 'resolved' ? (
                    <button
                      className="action-button"
                      onClick={() => handleResolve(row.id)}
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className={`status-badge ${getStatusClass(row.status)}`}>Resolved</span>
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

export default AssignedIssues;
