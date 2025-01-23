// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import AttendancePage from "./AttendancePage";
import * as XLSX from "xlsx";
import SummaryPage from "./SummaryPage";
import Dashboard from "./Dashboard";
import { parseCSV, parseExcelData } from './utils'; // Assuming you create a utils file for parsing

function App() {
  const [formDetails, setFormDetails] = useState({
    professor: "",
    subjects: [],
    branch: "",
    section: "",
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
  const [attendanceData, setAttendanceData] = useState({}); // New state for attendance data

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

  const handleAttendanceFileUpload = (e, subjectIndex) => {
    const file = e.target.files[0];
    if (file) {
        const fileType = file.name.split(".").pop().toLowerCase();
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            let parsedData  ;

            try {
                if (fileType === "csv") {
                    const text = event.target.result;
                    parsedData = parseCSV(text); // Function to parse CSV
                } else if (fileType === "xlsx" || fileType === "xls") {
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convert to JSON
                } else {
                    alert("Please upload a valid .csv or .xlsx file.");
                    return;
                }

                // Update attendance data for the specific subject
                setAttendanceData(prev => ({
                    ...prev,
                    [formDetails.subjects[subjectIndex].name]: parsedData,
                }));
            } catch (error) {
                console.error("Error parsing file:", error);
                alert("Failed to parse the file. Please ensure it is in the correct format.");
            }
        };

        if (fileType === "csv") {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { professor, subjects, branch, section } = formDetails;

    if (!professor || subjects.length === 0 || !branch || !section) {
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

  const handleAddSubject = () => {
    setFormDetails(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", totalLectures: "" }],
    }));
  };

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
                <label>Subjects</label>
                {formDetails.subjects.map((subject, index) => (
                  <div key={`subject-${index}`}>
                    <h3>Subject {index + 1}</h3>
                    <select
                      value={subject.name}
                      onChange={(e) => {
                        const newSubjects = [...formDetails.subjects];
                        newSubjects[index].name = e.target.value;
                        setFormDetails(prev => ({
                          ...prev,
                          subjects: newSubjects,
                        }));
                      }}
                      required
                    >
                      <option value="">Select Subject</option>
                      {options.subjects && options.subjects
                        .filter((subjectOption) => 
                          !formDetails.subjects.some(s => s.name === subjectOption) || subject.name === subjectOption
                        )
                        .map((subjectOption, subjectIndex) => (
                          <option key={`subjectOption-${subjectIndex}`} value={subjectOption}>
                            {subjectOption}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Total Lectures"
                      value={subject.totalLectures}
                      onChange={(e) => {
                        const newSubjects = [...formDetails.subjects];
                        newSubjects[index].totalLectures = e.target.value; // Update total lectures
                        setFormDetails(prev => ({
                          ...prev,
                          subjects: newSubjects,
                        }));
                      }}
                      required
                    />
                    <div>
                      <label>Upload Attendance Data (CSV/XLSX)</label>
                      <input
                        type="file"
                        accept=".csv, .xlsx"
                        onChange={(e) => handleAttendanceFileUpload(e, index)}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddSubject}>
                  Add Subject
                </button>
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

              <div className="warning-message">
                <p style={{ color: 'red' }}>
                  Please ensure that the uploaded database contains a column named "Student".
                </p>
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
