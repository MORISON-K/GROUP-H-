// IssueSubmission_form.js
import React, { useState, useEffect } from 'react'; 
import { useAuth } from './auth';
import api from './api';
import './IssueSubmission.css';


function IssueSubmission_form() {
  const { user } = useAuth();
  // Front-end form data using camelCase keys.
  const [formData, setFormData] = useState({
    yearOfStudy: "",
    semester: "",
    courseUnit: "",
    issueCategory: "",
    description: "",
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [issueCategories, setIssueCategories] = useState([]);

  // Fetch options from the backend: year of study, semester, course unit, and issue category.
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch all options in parallel.
        const [yearsRes, semestersRes, coursesRes, issueCategoriesRes] = await Promise.all([
          api.get('/api/years/'),
          api.get('/api/semesters/'),
          api.get('/api/courses/'),
          api.get('/api/issue-categories/')
        ]);
        
        // Validate and set course options.
        if (coursesRes.data && Array.isArray(coursesRes.data)) {
          setCourses(coursesRes.data);
        } else {
          console.error('Invalid courses response:', coursesRes);
          alert('Failed to load course data');
        }
        setYears(yearsRes.data);
        setSemesters(semestersRes.data);
        setIssueCategories(issueCategoriesRes.data);

      } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        alert('Failed to load form options');
      }
    };
    fetchOptions();
  }, []);

  // Update form data on change.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  

  // Multi-step form configuration.
  const steps = [
    { title: 'Your ID', field: null },
    { title: 'Year of Study', field: 'yearOfStudy' },
    { title: 'Semester', field: 'semester' },
    { title: 'Course Unit', field: 'courseUnit' },
    { title: 'Issue Category', field: 'issueCategory' },
    { title: 'Description', field: 'description' },
    { title: 'Confirmation', field: null }
  ];

  // Validate current step before proceeding.
  const validateStep = (step) => {
    const field = steps[step - 1]?.field;
    return field ? !!formData[field] : true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      alert(`Please complete the ${steps[currentStep - 1].title} step`);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit handler: maps front-end keys (camelCase) to back-end field names.
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        year_of_study: formData.yearOfStudy,
        semester: formData.semester,
        category: formData.issueCategory,
        description: formData.description,
        // student: user.id,
        course: parseInt(formData.courseUnit), // Ensure numeric course ID
      };
      
      const response = await api.post('/api/issues/', payload);
      
      if (response.status === 201) {
        alert("Issue submitted successfully!");
        // Reset the form fields and the step.
        setFormData({
          yearOfStudy: "",
          semester: "",
          courseUnit: "",
          issueCategory: "",
          description: "",
        });
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Submission Error:', error.response?.data);
      alert(`Submission failed: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  };

  // Render the progress bar.
  const renderProgress = () => (
    <div className="progress-indicator">
      {steps.map((_, index) => (
        <React.Fragment key={index + 1}>
          <div className={`step ${currentStep >= (index + 1) ? 'active' : ''}`}>
            {index + 1}
          </div>
          {index < steps.length - 1 && <div className="connector"></div>}
        </React.Fragment>
      ))}
    </div>
  );

  // Render the course unit selection step.
  const renderCourseSelect = () => (
    <div className="form-step">
      <h1>Course Unit</h1>
      <select 
        name="courseUnit" 
        value={formData.courseUnit} 
        onChange={handleChange} 
        className="issueContent"
        required
      >
        <option value="">Select Course Unit</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>
            {course.code} - {course.name}
          </option>
        ))}
      </select>
      {courses.length === 0 && (
        <p className="error-message">No courses available. Contact administrator.</p>
      )}
      <div className="form-navigation">
        <button type="button" onClick={prevStep} className="prev-button">Previous</button>
        <button type="button" onClick={nextStep} className="next-button">Next</button>
      </div>
    </div>
  );

  // Main render function.
  return (
    <div className="issueForm">
      <h2 className="issueh2">Issue Submission Form</h2>
      {renderProgress()}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Display Role ID from the user object */}
        {currentStep === 1 && (
          <div className="form-step">
            <h1>Your ID</h1>
            <p className="role-id">Role ID: {user?.role_id}</p>
            <div className="form-navigation">
              <button type="button" onClick={nextStep} className="next-button">Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Year of Study */}
        {currentStep === 2 && (
          <div className="form-step">
            <h1>Year of Study</h1>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="issueContent"
              required
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="prev-button">Previous</button>
              <button type="button" onClick={nextStep} className="next-button">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Semester */}
        {currentStep === 3 && (
          <div className="form-step">
            <h1>Semester</h1>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="issueContent"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="prev-button">Previous</button>
              <button type="button" onClick={nextStep} className="next-button">Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Course Unit */}
        {currentStep === 4 && renderCourseSelect()}

        {/* Step 5: Issue Category (fetched from the backend) */}
        {currentStep === 5 && (
          <div className="form-step">
            <h1>Issue Category</h1>
            <select
              name="issueCategory"
              value={formData.issueCategory}
              onChange={handleChange}
              className="issueContent"
              required
            >
              <option value="">Select Category</option>
              {issueCategories.map((cat, index) => (
                <option key={index} value={cat.value}>
                  {cat.display}
                </option>
              ))}
            </select>
            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="prev-button">Previous</button>
              <button type="button" onClick={nextStep} className="next-button">Next</button>
            </div>
          </div>
        )}

        {/* Step 6: Description */}
        {currentStep === 6 && (
          <div className="form-step">
            <h1>Description</h1>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="issueContent description-input"
              rows="5"
              placeholder="Describe your issue in detail..."
              required
            />
            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="prev-button">Previous</button>
              <button type="button" onClick={nextStep} className="next-button">Next</button>
            </div>
          </div>
        )}

        {/* Step 7: Confirmation */}
        {currentStep === 7 && (
          <div className="form-step confirmation-step">
            <h1>Confirmation</h1>
            <div className="summary-container">
              <p><strong>Year:</strong> {formData.yearOfStudy}</p>
              <p><strong>Semester:</strong> {formData.semester}</p>
              <p>
                <strong>Course:</strong> {
                  courses.find(c => c.id === parseInt(formData.courseUnit))?.name || 'N/A'
                }
              </p>
              <p><strong>Category:</strong> {formData.issueCategory}</p>
              <p><strong>Description:</strong> {formData.description}</p>
            </div>
            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="prev-button">Previous</button>
              <button type="submit" className="submit-button">Submit Issue</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default IssueSubmission_form;
