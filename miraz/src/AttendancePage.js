// src/AttendancePage.js
import React, { useState } from "react";
import "./AttendancePage.css";

const AttendancePage = ({ students, totalClasses, onSave, onShowSummary, subjects }) => {
  const [detainedCriteria, setDetainedCriteria] = useState(75);
  const [attendance, setAttendance] = useState(
    students.map((student) => ({
      ...student,
      subjectAttendance: subjects.reduce((acc, subject) => {
        acc[subject.name] = 0;
        return acc;
      }, {})
    }))
  );

  const handleAttendanceChange = (studentIndex, subjectName, value) => {
    const updatedAttendance = [...attendance];
    updatedAttendance[studentIndex].subjectAttendance[subjectName] = parseInt(value) || 0;
    setAttendance(updatedAttendance);
  };

  const handleSubmit = () => {
    const updatedAttendance = attendance.map((student) => {
      // Calculate attendance percentage for each subject
      const subjectPercentages = {};
      let totalAttended = 0;
      let totalClasses = 0;

      subjects.forEach(subject => {
        const attended = student.subjectAttendance[subject.name] || 0;
        const total = parseInt(subject.totalLectures);
        const percentage = (attended / total) * 100;
        subjectPercentages[subject.name] = percentage;
        totalAttended += attended;
        totalClasses += total;
      });

      const overallPercentage = (totalAttended / totalClasses) * 100;
      
      // Student is detained if overall attendance or any subject's attendance is below detainedCriteria
      const detained = overallPercentage < detainedCriteria || Object.values(subjectPercentages).some(percent => percent < detainedCriteria);

      return {
        ...student,
        attendance: student.subjectAttendance,
        totalAttended,
        percentage: overallPercentage,
        subjectPercentages,
        detained,
        detainedCriteria  // Add criteria to student data
      };
    });

    // Filter only detained students
    const detainedStudents = updatedAttendance.filter(student => student.detained);
    onShowSummary(detainedStudents);
    onSave(updatedAttendance);
  };

  return (
    <div className="attendance-page">
      <h1>Attendance Details</h1>
      <div className="criteria-input">
        <label>
          Detained Criteria (%):
          <input
            type="number"
            min="0"
            max="100"
            value={detainedCriteria}
            onChange={(e) => setDetainedCriteria(Number(e.target.value))}
            className="criteria-input-field"
          />
        </label>
      </div>
      <div className="attendance-table-container">
        <div className="attendance-table">
          <div className="table-header">
            <span>Student Name</span>
            {subjects.map((subject) => (
              <span key={subject.name}>{subject.name} (max: {subject.totalLectures})</span>
            ))}
          </div>
          <div className="table-body">
            {attendance.map((student, studentIndex) => (
              <div className="table-row" key={student.rollNumber}>
                <span>{student.name}</span>
                {subjects.map((subject) => (
                  <input
                    key={`${student.rollNumber}-${subject.name}`}
                    type="number"
                    min="0"
                    max={subject.totalLectures}
                    value={student.subjectAttendance[subject.name]}
                    onChange={(e) => handleAttendanceChange(studentIndex, subject.name, e.target.value)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="continue-button" onClick={handleSubmit}>
        NEXT
      </button>
    </div>
  );
}

export default AttendancePage;