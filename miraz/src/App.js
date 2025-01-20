// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import AttendancePage from "./AttendancePage";
import * as XLSX from "xlsx";
import SummaryPage from "./SummaryPage";
import Dashboard from "./Dashboard";

function App() {
  const [formDetails, setFormDetails] = useState({
    professor: "",
    subject: "",
    branch: "",
    section: "",
    totalClasses: "",
  });

  const [students, setStudents] = useState([]);
  const [showAttendancePage, setShowAttendancePage] = useState(false);
  const [showSummaryPage, setShowSummaryPage] = useState(false);
  const [detainedStudents, setDetainedStudents] = useState([]);
  const [options, setOptions] = useState({
    professors: [],
    subjects: [],
    branches: [],
  });
  const [showDashboard, setShowDashboard] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "totalClasses" && value < 0) {
      return;
    }

    setFormDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const fileType = file.name.split(".").pop().toLowerCase();

        if (fileType === "csv") {
          handleCSVFile(file);
        } else if (fileType === "xlsx" || fileType === "xls") {
          handleExcelFile(file);
        } else {
          alert("Please upload a valid .csv or .xlsx file.");
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  const handleCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsedStudents = parseCSV(text);
      setStudents(parsedStudents);
    };
    reader.readAsText(file);
  };
  const handleExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const parsedStudents = parseExcelData(jsonData);
        setStudents(parsedStudents);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Failed to process the Excel file. Please try again.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseCSV = (data) => {
    const rows = data.split("\n");
    const header = rows[0].split(",").map(col => col.trim());
    const studentIndex = header.indexOf("Student");

    if (studentIndex === -1) {
      alert("No 'Student' column found in the CSV file.");
      return [];
    }

    const validRows = rows.slice(1).filter(row => row.trim() !== "");
    return validRows.map((row) => {
      const columns = row.split(",");
      return {
        name: columns[studentIndex] ? columns[studentIndex].trim() : null,
        rollNumber: columns[studentIndex + 1] ? columns[studentIndex + 1].trim() : null,
      };
    });
  };

  const parseExcelData = (data) => {
    const header = data[0].map(col => col.trim());
    const studentIndex = header.indexOf("Student");

    if (studentIndex === -1) {
      alert("No 'Student' column found in the Excel file.");
      return [];
    }

    const validRows = data.slice(1).filter(row => row.length > 0);
    return validRows.map((row) => {
      return {
        name: row[studentIndex] || null,
        rollNumber: row[studentIndex + 1] || null,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { professor, subject, branch, section, totalClasses } = formDetails;

    if (!professor || !subject || !branch || !section || !totalClasses) {
      alert("Please fill out all the fields before continuing.");
      return;
    }

    if (students.length === 0) {
      alert("Please upload a valid student database file.");
      return;
    }

    setShowAttendancePage(true);
    console.log("Form submitted:", formDetails);
  };

  const handleSaveAttendance = (updatedStudents) => {
    console.log("Final Attendance Data:", updatedStudents);
    // You can add more functionality here if needed
  };

  const handleAddOption = async (type) => {
    try {
      const value = window.prompt(`Enter ${type} name:`);
      
      if (!value) return;
      
      const trimmedValue = value.trim();
      if (trimmedValue === '') return;
      
      setOptions(prevOptions => {
        const pluralType = `${type}s`;
        console.log('Adding new', type, ':', trimmedValue);
        
        const currentArray = prevOptions[pluralType] || [];
        
        const updatedOptions = {
          ...prevOptions,
          [pluralType]: [...currentArray, trimmedValue]
        };

        try {
          localStorage.setItem('options', JSON.stringify(updatedOptions));
          console.log('Successfully saved to localStorage');
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }

        return updatedOptions;
      });
    } catch (error) {
      console.error('Error in handleAddOption:', error);
    }
  };

  const handleDeleteOption = (type, index) => {
    const updatedOptions = { ...options };
    updatedOptions[type].splice(index, 1);
    setOptions(updatedOptions);
  };

  const handleShowSummary = (detainedStudents) => {
    setDetainedStudents(detainedStudents);
    setShowAttendancePage(false);
    setShowSummaryPage(true);
  };

  const handleBackToDashboard = () => {
    setShowSummaryPage(false);
    setShowAttendancePage(false);
  };

  useEffect(() => {
    try {
      const savedOptions = localStorage.getItem('options');
      console.log('Loading saved options:', savedOptions);
      
      if (savedOptions) {
        const parsed = JSON.parse(savedOptions);
        console.log('Parsed options:', parsed);
        setOptions(parsed);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      setOptions({
        professors: [],
        subjects: [],
        branches: [],
      });
    }
  }, []);

  useEffect(() => {
    console.log('Current options state:', options);
  }, [options]);

  return (
    <div className="App">
      {showDashboard ? (
        <Dashboard 
          options={options} 
          setOptions={setOptions} 
          handleDeleteOption={handleDeleteOption} 
          onClose={() => setShowDashboard(false)}
        />
      ) : (
        <div className="dashboard">
          <h1>Dashboard</h1>
          {!showAttendancePage && !showSummaryPage && (
            <button 
              className="manage-button" 
              onClick={() => setShowDashboard(true)}
            >
              Manage Professors, Branches, Subjects
            </button>
          )}

          {!showAttendancePage && !showSummaryPage ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Professor</label>
                <select
                  name="professor"
                  value={formDetails.professor}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Professor</option>
                  {options.professors && options.professors.map((professor, index) => (
                    <option key={`professor-${index}`} value={professor}>
                      {professor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select
                  name="subject"
                  value={formDetails.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Subject</option>
                  {options.subjects && options.subjects.map((subject, index) => (
                    <option key={`subject-${index}`} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Branch</label>
                <select
                  name="branch"
                  value={formDetails.branch}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Branch</option>
                  {options.branches && options.branches.map((branch, index) => (
                    <option key={`branch-${index}`} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Section</label>
                <input
                  type="text"
                  name="section"
                  value={formDetails.section}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Lectures</label>
                <input
                  type="number"
                  name="totalClasses"
                  value={formDetails.totalClasses}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="warning-message">
                <p style={{ color: 'red' }}>
                  Please ensure that the uploaded database contains a column named "Student".
                </p>
              </div>

              <div className="form-group">
                <p>Click here to insert the database of the student</p>
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={handleFileUpload}
                  required
                />
              </div>

              <button type="submit" className="submit-button">
                CONTINUE
              </button>
            </form>
          ) : showAttendancePage ? (
            <AttendancePage
              students={students}
              totalClasses={parseInt(formDetails.totalClasses)}
              onSave={handleSaveAttendance}
              onShowSummary={handleShowSummary}
            />
          ) : (
            <SummaryPage
              detainedStudents={detainedStudents}
              classDetails={formDetails}
              onBack={handleBackToDashboard}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
