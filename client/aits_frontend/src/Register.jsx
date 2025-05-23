import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from './api';
import LoadingIndicator from './LoadingIndicator';

// This is the initial state for the registration form
const Register = ({ handlePageChange }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    role: "",
    roleId: "",
    department: "",
    college: "",
    programme: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const navigate = useNavigate();


  // Handle page change to login
  // Fetch initial data for dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [collegesRes, departmentsRes, programmesRes] = await Promise.all([
          api.get('/api/colleges/'),
          api.get('/api/departments/'),
          api.get('/api/programmes/')
        ]);
        
        setColleges(collegesRes.data);
        setDepartments(departmentsRes.data);
        setProgrammes(programmesRes.data);
        setOptionsLoading(false);
      } catch (error) {
        console.error('Error fetching options:', error);
        setError("Failed to load sign up options");
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (event) => {
    setFormData({ 
      ...formData, 
      [event.target.name]: event.target.value 
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.userName || 
        !formData.email || !formData.role || !formData.roleId || 
        !formData.password || !formData.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }


    
    // Role-specific validation     
    if (formData.role === "student" && (!formData.college || !formData.programme)) {
      setError("Students must select a college and programme");
      return;
    }

    if (formData.role === "lecturer" && !formData.department) {
      setError("Lecturers must select a department");
      return;
    }

    if (formData.role === "academic registrar" && !formData.college) {
      setError("Academic Registrars must select a college");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username:        formData.userName,
        email:           formData.email,
        password:        formData.password,
        confirm_password: formData.confirmPassword,
        first_name:      formData.firstName,
        last_name:       formData.lastName,
        role:            formData.role,
        role_id:         formData.roleId
      };

      if (formData.role === "student") {
        payload.college_id   = formData.college;
        payload.programme_id = formData.programme;
      } else if (formData.role === "lecturer") {
        payload.department_id = formData.department;
      } else if (formData.role === "academic registrar") {
        payload.college_id = formData.college;
      }

      await api.post("/api/auth/register/", payload);
      setLoading(false);
      handlePageChange("login");
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      const errorMessage = error.response?.data?.error || 
                         Object.values(error.response?.data || {}).flat().join(', ') || 
                         "Registration failed. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (optionsLoading) {
    return <div className="Register-page"><LoadingIndicator /></div>;
  }

  return (
    <div className="Register-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="firstName" 
          placeholder="First Name" 
          className="First-Name" 
          value={formData.firstName} 
          onChange={handleChange} 
          required
        />
        <input 
          type="text" 
          name="lastName" 
          placeholder="Last Name" 
          className="Last-Name" 
          value={formData.lastName} 
          onChange={handleChange} 
          required
        />
        <br /><br />
        <input 
          type="text" 
          name="userName" 
          placeholder="User Name" 
          className="Register-input" 
          value={formData.userName} 
          onChange={handleChange} 
          required
        />
        <br />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          className="Register-input" 
          value={formData.email} 
          onChange={handleChange} 
          required
        />
        <br />
        <select 
          name="role" 
          value={formData.role} 
          onChange={handleChange} 
          className="Register-input"
          required
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="academic registrar">Academic Registrar</option>
        </select>
        <br />
        <input 
          type="text" 
          name="roleId" 
          placeholder="Role ID (e.g., Student ID, Staff ID)" 
          className="Register-input" 
          value={formData.roleId} 
          onChange={handleChange} 
          required
        />
        <br />

        {formData.role === "student" && (
          <>
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="Register-input"
              required
            >
              <option value="">Select College</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
            <br />
            <select
              name="programme"
              value={formData.programme}
              onChange={handleChange}
              className="Register-input"
              required
            >
              <option value="">Select Programme</option>
              {programmes.map(programme => (
                <option key={programme.id} value={programme.id}>
                  {programme.name} ({programme.code})
                </option>
              ))}
            </select>
            <br />
          </>
        )}

        {formData.role === "academic registrar" && (
          <>
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="Register-input"
              required
            >
              <option value="">Select College</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
            <br />
          </>
        )}

        {formData.role === "lecturer" && (
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="Register-input"
            required
          >
            <option value="">Select Department</option>
            {departments.map(department => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        )}
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          className="Register-input" 
          value={formData.password} 
          onChange={handleChange} 
          required
        />
        <br />
        <input 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm Password" 
          className="Register-input" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          required
        />
        <br />

        {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
        <br />
        {loading && <LoadingIndicator />}
        <button type="submit" className="Submit-Button" disabled={loading || optionsLoading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
