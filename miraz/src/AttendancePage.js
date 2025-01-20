// src/AttendancePage.js
import React, { useState } from "react";
import "./AttendancePage.css";

function AttendancePage({ students, totalClasses, onSave, onShowSummary }) {
  const [attendance, setAttendance] = useState(
    students.map((student) => ({ ...student, attended: 0 }))
  );

  const handleAttendanceChange = (index, value) => {
    const updatedAttendance = [...attendance];
    updatedAttendance[index].attended = parseInt(value) || 0;
    setAttendance(updatedAttendance);
  };

  const handleSubmit = () => {
    // Validate if all fields are filled
    const hasEmptyFields = attendance.some(student => student.attended === 0);
    if (hasEmptyFields) {
      alert("Please fill in attendance for all students");
      return;
    }

    // Calculate attendance and detained status
    const updatedAttendance = attendance.map((student) => {
      const percentage = (student.attended / totalClasses) * 100;
      return { ...student, percentage, detained: percentage < 75 };
    });

    // Get the list of detained students
    const detainedStudents = updatedAttendance.filter(student => student.detained);
    
    // First show the summary page with detained students
    onShowSummary(detainedStudents);
    
    // Then save the attendance data
    onSave(updatedAttendance);
  };

  return (
    <div className="attendance-page">
      <h1>Attendance Details</h1>
      <div className="attendance-table">
        <div className="table-header">
          <span>Student Name</span>
          <span>Classes Attended</span>
        </div>
        {attendance.map((student, index) => (
          <div className="table-row" key={student.rollNumber}>
            <span>{student.name}</span>
            <input
              type="number"
              min="0"
              max={totalClasses}
              value={student.attended}
              onChange={(e) => handleAttendanceChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button className="continue-button" onClick={handleSubmit}>
        NEXT
      </button>
    </div>
  );
}

export default AttendancePage;
